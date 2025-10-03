'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Sparkles, Loader as Loader2 } from 'lucide-react';

interface Country {
  name: { common: string };
  idd: { root: string; suffixes: string[] };
  cca2: string;
  flags: { svg: string };
}

export default function LoginPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2,flags')
      .then((res) => res.json())
      .then((data: Country[]) => {
        const sorted = data
          .filter((c) => c.idd?.root)
          .sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(sorted);
      })
      .catch(() => toast.error('Failed to load countries'));
  }, []);

  const handleSendOTP = () => {
    setError('');
    if (!phoneNumber || phoneNumber.length < 6) {
      setError('Please enter a valid phone number');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      toast.success('OTP sent successfully!');
    }, 1500);
  };

  const handleVerifyOTP = () => {
    setError('');
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Login successful!');
    }, 1500);
  };

  const getCountryCode = (country: Country) => {
    const root = country.idd.root;
    const suffix = country.idd.suffixes?.[0] || '';
    return `${root}${suffix}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome</h1>
          <p className="text-muted-foreground mt-2">Sign in to continue to your AI assistant</p>
        </div>

        <div className="bg-card border rounded-2xl p-8 shadow-lg">
          <AnimatePresence mode="wait">
            {!otpSent ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="country">Country Code</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.cca2} value={getCountryCode(country)}>
                          <div className="flex items-center gap-2">
                            <img src={country.flags.svg} alt="" className="w-5 h-4 object-cover" />
                            <span>{country.name.common}</span>
                            <span className="text-muted-foreground ml-auto">
                              {getCountryCode(country)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-2 border rounded-md bg-muted/50 text-sm">
                      {selectedCountry}
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                      className="flex-1"
                    />
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Enter OTP</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sent to {selectedCountry} {phoneNumber}
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  onClick={handleVerifyOTP}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setError('');
                  }}
                  className="w-full"
                >
                  Change phone number
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
