import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Trash2, Apple, AlertTriangle, Recycle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

const guideItems = [
  {
    title: 'Dry Waste',
    icon: Trash2,
    color: 'bg-blue-50 text-blue-600',
    borderColor: 'border-blue-200',
    binColor: 'Blue Bin',
    examples: ['Paper', 'Cardboard', 'Plastic bottles', 'Glass jars', 'Metal cans', 'Dry leaves'],
    description: 'Non-biodegradable waste that can be recycled or processed.'
  },
  {
    title: 'Wet Waste',
    icon: Apple,
    color: 'bg-emerald-50 text-emerald-600',
    borderColor: 'border-emerald-200',
    binColor: 'Green Bin',
    examples: ['Food scraps', 'Vegetable peels', 'Fruit waste', 'Coffee grounds', 'Eggshells'],
    description: 'Biodegradable organic waste that can be composted.'
  },
  {
    title: 'Hazardous Waste',
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-600',
    borderColor: 'border-red-200',
    binColor: 'Red/Black Bin',
    examples: ['Batteries', 'Light bulbs', 'Paint cans', 'Chemicals', 'Medical waste', 'Electronics'],
    description: 'Waste that poses a potential threat to public health or the environment.'
  }
];

export const GuidePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900">Waste Segregation Guide</h1>
        <p className="text-gray-500 mt-2">
          Proper waste segregation is the first step towards a sustainable city. Use this guide to separate your waste correctly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {guideItems.map((item, i) => (
          <Card key={i} className={cn("border-t-4", item.borderColor)}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className={cn("p-3 rounded-xl", item.color)}>
                  <item.icon className="h-6 w-6" />
                </div>
                <Badge variant={item.title === 'Hazardous Waste' ? 'error' : item.title === 'Wet Waste' ? 'success' : 'info'}>
                  {item.binColor}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Examples</p>
                <div className="flex flex-wrap gap-2">
                  {item.examples.map((ex, j) => (
                    <span key={j} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-100">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400 italic">
                <Info className="h-3 w-3" />
                Ensure items are clean and dry before disposal.
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-emerald-900 text-white border-none">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-bold">Why Segregate?</h2>
            <ul className="space-y-2 text-emerald-100">
              <li className="flex items-start gap-2">
                <Recycle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span>Reduces the amount of waste sent to landfills.</span>
              </li>
              <li className="flex items-start gap-2">
                <Recycle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span>Makes the recycling process more efficient and cost-effective.</span>
              </li>
              <li className="flex items-start gap-2">
                <Recycle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span>Prevents toxic chemicals from leaching into the soil and water.</span>
              </li>
            </ul>
          </div>
          <div className="flex-shrink-0">
            <div className="h-32 w-32 bg-emerald-800 rounded-full flex items-center justify-center">
              <Recycle className="h-16 w-16 text-emerald-400" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
