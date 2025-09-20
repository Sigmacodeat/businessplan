import React from 'react';
import TableSimple from '@ui/TableSimple';

type Competitor = {
  name: string;
  speed: number; // m/s
  payload: number; // kg
  price: string;
  autonomy: string;
};

const competitors: Competitor[] = [
  { name: 'Boston Dynamics Atlas', speed: 2.5, payload: 11, price: '€2M+', autonomy: '30 min' },
  { name: 'Agility Robotics Digit', speed: 1.5, payload: 16, price: '€250k', autonomy: '3h' },
  { name: 'OUR SOLUTION', speed: 1.8, payload: 15, price: '€150k', autonomy: '8h' },
];

export default function AnnexCompetition() {
  return (
    <div className="avoid-break-inside">
      <h3 className="font-semibold">Competitive Benchmark</h3>
      <TableSimple
        headers={['Competitor', 'Speed (m/s)', 'Payload (kg)', 'Price', 'Autonomy']}
        rows={competitors.map(c => [c.name, c.speed, c.payload, c.price, c.autonomy])}
      />
    </div>
  );
}
