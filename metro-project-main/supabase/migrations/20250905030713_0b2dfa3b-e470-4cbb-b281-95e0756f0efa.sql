-- Fix security warnings by setting search_path for functions

-- Fix generate_keywords function
CREATE OR REPLACE FUNCTION public.generate_keywords(title TEXT, description TEXT)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  keywords TEXT[];
  word TEXT;
BEGIN
  -- Convert to lowercase and split into words
  keywords := string_to_array(lower(regexp_replace(title || ' ' || description, '[^a-zA-Z0-9\s]', ' ', 'g')), ' ');
  
  -- Filter out empty strings and short words
  keywords := array(
    SELECT DISTINCT unnest(keywords) 
    WHERE length(unnest(keywords)) > 2
  );
  
  RETURN keywords;
END;
$$;

-- Fix find_matching_reports function
CREATE OR REPLACE FUNCTION public.find_matching_reports(report_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  report_type report_type,
  station_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  match_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_report RECORD;
  opposite_type report_type;
BEGIN
  -- Get current report details
  SELECT * INTO current_report FROM public.lost_and_found WHERE public.lost_and_found.id = report_id;
  
  -- Determine opposite report type
  IF current_report.report_type = 'lost' THEN
    opposite_type := 'found';
  ELSE
    opposite_type := 'lost';
  END IF;
  
  -- Find matching reports based on keywords, item type, and station
  RETURN QUERY
  SELECT 
    lf.id,
    lf.title,
    lf.description,
    lf.report_type,
    lf.station_name,
    lf.created_at,
    (
      CASE WHEN lf.item_type = current_report.item_type THEN 3 ELSE 0 END +
      CASE WHEN lf.station_name = current_report.station_name THEN 2 ELSE 0 END +
      (SELECT COUNT(*) FROM unnest(lf.keywords) k WHERE k = ANY(current_report.keywords))::INTEGER
    ) AS match_score
  FROM public.lost_and_found lf
  WHERE 
    lf.report_type = opposite_type
    AND lf.status = 'active'
    AND lf.id != report_id
    AND (
      lf.item_type = current_report.item_type OR
      lf.station_name = current_report.station_name OR
      lf.keywords && current_report.keywords
    )
  ORDER BY match_score DESC, lf.created_at DESC
  LIMIT 10;
END;
$$;

-- Fix set_keywords_trigger function
CREATE OR REPLACE FUNCTION public.set_keywords_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.keywords := public.generate_keywords(NEW.title, NEW.description);
  RETURN NEW;
END;
$$;