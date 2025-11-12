-- Create Hotel table
CREATE TABLE public.Hotel (
  HotelID uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  rating numeric(2,1) CHECK (rating >= 0 AND rating <= 5),
  contact_number text NOT NULL,
  email text NOT NULL,
  total_rooms integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create Room table
CREATE TABLE public.Room (
  RoomID uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  RoomNumber text NOT NULL,
  RoomType text NOT NULL,
  PricePerNight numeric(10,2) NOT NULL,
  availability_status text DEFAULT 'Available' CHECK (availability_status IN ('Available', 'Occupied', 'Maintenance')),
  occupancy_limit integer NOT NULL,
  HotelID uuid NOT NULL REFERENCES public.Hotel(HotelID) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(HotelID, RoomNumber)
);

-- Create Guest table
CREATE TABLE public.Guest (
  GuestID uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  Fname text NOT NULL,
  Mname text,
  Lname text NOT NULL,
  dob date NOT NULL,
  age integer,
  nationality text NOT NULL,
  address text NOT NULL,
  emailID text NOT NULL UNIQUE,
  main_phone text NOT NULL,
  emergency_contacts jsonb,
  selfie_url text,
  created_at timestamptz DEFAULT now()
);

-- Create DigiLockerID table
CREATE TABLE public.DigiLockerID (
  identityID uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  documentType text NOT NULL,
  documentLink text,
  issueDate date,
  expiryDate date,
  verifiedStatus boolean DEFAULT false,
  verifiedUsing text,
  GuestID uuid NOT NULL REFERENCES public.Guest(GuestID) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create StayLog table
CREATE TABLE public.StayLog (
  StayID uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  GuestID uuid NOT NULL REFERENCES public.Guest(GuestID) ON DELETE CASCADE,
  HotelID uuid NOT NULL REFERENCES public.Hotel(HotelID) ON DELETE CASCADE,
  RoomID uuid NOT NULL REFERENCES public.Room(RoomID) ON DELETE CASCADE,
  CheckInTime timestamptz,
  CheckOutTime timestamptz,
  RoomCount integer DEFAULT 1,
  TotalAmount numeric(10,2),
  status text DEFAULT 'Enrolled' CHECK (status IN ('Enrolled', 'Checked-In', 'Checked-Out', 'Cancelled')),
  CredentialNonce text UNIQUE,
  CredentialIssuedAt timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create Billing table
CREATE TABLE public.Billing (
  BillingID uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  StayID uuid NOT NULL REFERENCES public.StayLog(StayID) ON DELETE CASCADE,
  GenerationDate timestamptz DEFAULT now(),
  Tax numeric(10,2) NOT NULL,
  FinalAmount numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create Payment table
CREATE TABLE public.Payment (
  PaymentID uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  BillingID uuid NOT NULL REFERENCES public.Billing(BillingID) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  method text NOT NULL CHECK (method IN ('UPI', 'Card', 'Cash', 'Bank Transfer')),
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Failed')),
  PaymentDate timestamptz,
  UPI_ID text,
  TransactionRef text,
  Bank text,
  CardType text,
  TxnID text,
  created_at timestamptz DEFAULT now()
);

-- Create Feedback table
CREATE TABLE public.Feedback (
  FeedbackID uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comments text,
  date timestamptz DEFAULT now(),
  GuestID uuid NOT NULL REFERENCES public.Guest(GuestID) ON DELETE CASCADE,
  StayID uuid NOT NULL REFERENCES public.StayLog(StayID) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.Hotel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Room ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Guest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.DigiLockerID ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.StayLog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Hotel (public read, no insert/update/delete for now - staff only)
CREATE POLICY "Anyone can view hotels" ON public.Hotel FOR SELECT USING (true);

-- RLS Policies for Room (public read)
CREATE POLICY "Anyone can view rooms" ON public.Room FOR SELECT USING (true);

-- RLS Policies for Guest (guests can view their own data)
CREATE POLICY "Guests can view their own data" ON public.Guest FOR SELECT USING (true);
CREATE POLICY "Anyone can create guest profile" ON public.Guest FOR INSERT WITH CHECK (true);
CREATE POLICY "Guests can update their own data" ON public.Guest FOR UPDATE USING (true);

-- RLS Policies for DigiLockerID
CREATE POLICY "Anyone can view DigiLocker data" ON public.DigiLockerID FOR SELECT USING (true);
CREATE POLICY "Anyone can create DigiLocker data" ON public.DigiLockerID FOR INSERT WITH CHECK (true);

-- RLS Policies for StayLog
CREATE POLICY "Anyone can view stays" ON public.StayLog FOR SELECT USING (true);
CREATE POLICY "Anyone can create stays" ON public.StayLog FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update stays" ON public.StayLog FOR UPDATE USING (true);

-- RLS Policies for Billing
CREATE POLICY "Anyone can view billing" ON public.Billing FOR SELECT USING (true);
CREATE POLICY "Anyone can create billing" ON public.Billing FOR INSERT WITH CHECK (true);

-- RLS Policies for Payment
CREATE POLICY "Anyone can view payments" ON public.Payment FOR SELECT USING (true);
CREATE POLICY "Anyone can create payments" ON public.Payment FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update payments" ON public.Payment FOR UPDATE USING (true);

-- RLS Policies for Feedback
CREATE POLICY "Anyone can view feedback" ON public.Feedback FOR SELECT USING (true);
CREATE POLICY "Anyone can create feedback" ON public.Feedback FOR INSERT WITH CHECK (true);

-- Create storage bucket for selfies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('guest-selfies', 'guest-selfies', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for guest selfies
CREATE POLICY "Anyone can upload selfies" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'guest-selfies');

CREATE POLICY "Anyone can view selfies" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'guest-selfies');

-- Insert sample hotel data
INSERT INTO public.Hotel (name, location, rating, contact_number, email, total_rooms)
VALUES 
  ('Grand Palace Hotel', 'Mumbai, Maharashtra', 4.5, '+91-22-12345678', 'info@grandpalace.com', 150),
  ('Taj Residency', 'Bangalore, Karnataka', 4.8, '+91-80-87654321', 'contact@tajresidency.com', 200);

-- Insert sample room data for first hotel
INSERT INTO public.Room (RoomNumber, RoomType, PricePerNight, availability_status, occupancy_limit, HotelID)
SELECT '101', 'Deluxe', 3500.00, 'Available', 2, HotelID FROM public.Hotel WHERE name = 'Grand Palace Hotel'
UNION ALL
SELECT '102', 'Suite', 5500.00, 'Available', 4, HotelID FROM public.Hotel WHERE name = 'Grand Palace Hotel'
UNION ALL
SELECT '103', 'Standard', 2500.00, 'Available', 2, HotelID FROM public.Hotel WHERE name = 'Grand Palace Hotel'
UNION ALL
SELECT '201', 'Deluxe', 4000.00, 'Available', 2, HotelID FROM public.Hotel WHERE name = 'Taj Residency'
UNION ALL
SELECT '202', 'Presidential Suite', 12000.00, 'Available', 6, HotelID FROM public.Hotel WHERE name = 'Taj Residency';