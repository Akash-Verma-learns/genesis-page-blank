-- Update RLS policies for hotel table to allow insertions
CREATE POLICY "Anyone can register a hotel" 
ON public.hotel 
FOR INSERT 
WITH CHECK (true);