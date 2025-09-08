import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Heart, ShieldAlert } from 'lucide-react';

interface MedicalDisclaimerProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function MedicalDisclaimer({ isOpen, onAccept }: MedicalDisclaimerProps) {
  const [hasReadDisclaimer, setHasReadDisclaimer] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10);

  useEffect(() => {
    if (isOpen && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, timeRemaining]);

  const handleAccept = () => {
    if (hasReadDisclaimer && timeRemaining === 0) {
      onAccept();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-red-900">
              IMPORTANT MEDICAL DISCLAIMER
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Primary Warning */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-red-900">NOT MEDICAL ADVICE</h3>
                <p className="text-sm text-red-800 leading-relaxed">
                  This AI fitness coach provides general fitness and nutrition information only. 
                  It is <strong>NOT a substitute for professional medical advice, diagnosis, or treatment</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Health Warnings */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-amber-900">Consult Healthcare Professionals</h3>
                <div className="text-sm text-amber-800 space-y-2">
                  <p><strong>ALWAYS consult your doctor before:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Starting any new exercise program</li>
                    <li>Making significant changes to your diet</li>
                    <li>Taking any fitness or nutrition advice</li>
                    <li>If you have any health conditions or concerns</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Acknowledgment */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Important Acknowledgments:</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>Exercise carries inherent risks including injury, cardiac events, and other health complications</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>Dietary changes can affect medications, health conditions, and nutritional needs</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>Individual health needs vary greatly - what works for others may not work for you</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>AI-generated advice may contain errors and should never replace professional guidance</span>
              </div>
            </div>
          </div>

          {/* Emergency Notice */}
          <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">Medical Emergency</h3>
            <p className="text-sm text-red-800">
              If you experience any health emergency or concerning symptoms during exercise, 
              <strong> STOP immediately and seek emergency medical care</strong>. Call emergency services if needed.
            </p>
          </div>

          {/* Legal Disclaimer */}
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
            <p>
              By using this AI fitness coach, you acknowledge that you understand these warnings and agree that 
              the service providers are not responsible for any health consequences resulting from following AI-generated advice. 
              You use this service at your own risk and responsibility.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col space-y-4">
          <div className="flex items-start space-x-2 w-full">
            <Checkbox
              id="disclaimer-read"
              checked={hasReadDisclaimer}
              onCheckedChange={(checked) => setHasReadDisclaimer(checked as boolean)}
            />
            <label
              htmlFor="disclaimer-read"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and understand all the medical disclaimers and warnings above
            </label>
          </div>
          
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-gray-600">
              {timeRemaining > 0 && (
                <span>Please wait {timeRemaining} seconds to continue...</span>
              )}
            </div>
            <Button
              onClick={handleAccept}
              disabled={!hasReadDisclaimer || timeRemaining > 0}
              className="bg-red-600 hover:bg-red-700"
            >
              I Understand - Continue to Chat
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
