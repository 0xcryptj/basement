-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.cleanup_old_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE "Message"
  SET "isDeleted" = true,
      "content" = '[Message deleted due to retention policy]',
      "imageUrl" = null
  WHERE "createdAt" < NOW() - INTERVAL '30 days'
  AND "isDeleted" = false;
  
  DELETE FROM "Message"
  WHERE "createdAt" < NOW() - INTERVAL '60 days'
  AND "isDeleted" = true;
END;
$function$;