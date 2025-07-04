
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

const SensorHeader = ({ onBack }: { onBack: () => void }) => (
  <div className="mb-4">
    <Button
      onClick={onBack}
      size="lg"
      className="bg-slate-700 hover:bg-slate-600 h-12 sm:h-16"
    >
      <ArrowLeft className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
      <span className="text-sm sm:text-lg lg:text-xl font-bold">VOLVER A SENSORES</span>
    </Button>
  </div>
);

export default SensorHeader;
