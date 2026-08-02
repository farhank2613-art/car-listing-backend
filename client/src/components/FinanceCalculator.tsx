import { useMemo, useState } from 'react';
import { formatPrice } from '../api';

interface Props {
  price: number;
}

export default function FinanceCalculator({ price }: Props) {
  const [down, setDown] = useState(Math.round(price * 0.1 / 500) * 500);
  const [months, setMonths] = useState(60);
  const [apr, setApr] = useState(6.9);

  const { monthly, total, interest } = useMemo(() => {
    const principal = Math.max(0, price - down);
    const r = apr / 100 / 12;
    const monthly = r === 0 ? principal / months : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    const total = monthly * months;
    return { monthly, total, interest: total - principal };
  }, [price, down, months, apr]);

  return (
    <div className="calc">
      <h3>Estimate your monthly payment</h3>
      <label htmlFor="down">Down payment — {formatPrice(down)}</label>
      <input id="down" type="range" min={0} max={price} step={500} value={down} onChange={(e) => setDown(Number(e.target.value))} />
      <label htmlFor="months">Loan term — {months} months</label>
      <input id="months" type="range" min={12} max={84} step={6} value={months} onChange={(e) => setMonths(Number(e.target.value))} />
      <label htmlFor="apr">Interest rate — {apr.toFixed(1)}%</label>
      <input id="apr" type="range" min={1} max={20} step={0.1} value={apr} onChange={(e) => setApr(Number(e.target.value))} />
      <div className="calc-output">
        <div className="pmt">{formatPrice(Math.round(monthly))}<span style={{ fontSize: 14 }}>/mo</span></div>
        <div className="breakdown">
          <span>Vehicle price: {formatPrice(price)}</span>
          <span>Down payment: {formatPrice(down)}</span>
          <span>Financed: {formatPrice(Math.max(0, price - down))}</span>
          <span>Total paid: {formatPrice(Math.round(total))} (incl. {formatPrice(Math.round(interest))} interest)</span>
        </div>
      </div>
    </div>
  );
}
