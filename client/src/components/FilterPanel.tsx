import { useMemo } from 'react';
import type { Filters, Meta } from '../types';

interface Props {
  meta: Meta;
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
  activeCount: number;
}

function CheckGroup({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="filter-group">
      <h4>{label}</h4>
      <div className="check-list">
        {options.map((opt) => (
          <label key={opt} className="check-row">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={(e) =>
                onChange(e.target.checked ? [...selected, opt] : selected.filter((x) => x !== opt))
              }
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function FilterPanel({ meta, filters, onChange, onClear, activeCount }: Props) {
  const models = useMemo(() => {
    const found = meta.makes.find((m) => m.make === filters.make);
    return found ? found.models : meta.makes.flatMap((m) => m.models);
  }, [meta.makes, filters.make]);

  return (
    <aside className="filter-panel">
      <div className="filter-group">
        <h4>Search</h4>
        <input
          type="search"
          placeholder="Keyword, make, VIN…"
          value={filters.q ?? ''}
          onChange={(e) => onChange({ q: e.target.value })}
        />
      </div>

      <div className="filter-group">
        <h4>Make</h4>
        <select value={filters.make ?? ''} onChange={(e) => onChange({ make: e.target.value || undefined, model: undefined })}>
          <option value="">All makes</option>
          {meta.makes.map((m) => (
            <option key={m.make} value={m.make}>
              {m.make} ({m.count})
            </option>
          ))}
        </select>
        <h4>Model</h4>
        <select value={filters.model ?? ''} onChange={(e) => onChange({ model: e.target.value || undefined })}>
          <option value="">All models</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <h4>Price range</h4>
        <div className="range-row">
          <input type="number" placeholder="Min $" value={filters.minPrice ?? ''} onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })} />
          <input type="number" placeholder="Max $" value={filters.maxPrice ?? ''} onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
      </div>

      <div className="filter-group">
        <h4>Year</h4>
        <div className="range-row">
          <input type="number" placeholder="From" value={filters.minYear ?? ''} onChange={(e) => onChange({ minYear: e.target.value ? Number(e.target.value) : undefined })} />
          <input type="number" placeholder="To" value={filters.maxYear ?? ''} onChange={(e) => onChange({ maxYear: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
      </div>

      <div className="filter-group">
        <h4>Max mileage</h4>
        <select value={filters.maxMileage ?? ''} onChange={(e) => onChange({ maxMileage: e.target.value ? Number(e.target.value) : undefined })}>
          <option value="">No limit</option>
          <option value="10000">Under 10,000 mi</option>
          <option value="25000">Under 25,000 mi</option>
          <option value="50000">Under 50,000 mi</option>
          <option value="75000">Under 75,000 mi</option>
          <option value="100000">Under 100,000 mi</option>
        </select>
      </div>

      <CheckGroup label="Body type" options={meta.bodyTypes} selected={filters.bodyType ?? []} onChange={(bodyType) => onChange({ bodyType })} />
      <CheckGroup label="Fuel type" options={meta.fuelTypes} selected={filters.fuelType ?? []} onChange={(fuelType) => onChange({ fuelType })} />
      <CheckGroup label="Transmission" options={meta.transmissions} selected={filters.transmission ?? []} onChange={(transmission) => onChange({ transmission })} />
      <CheckGroup label="Drivetrain" options={meta.drivetrains} selected={filters.drivetrain ?? []} onChange={(drivetrain) => onChange({ drivetrain })} />
      <CheckGroup label="Condition" options={meta.conditions} selected={filters.condition ?? []} onChange={(condition) => onChange({ condition })} />

      <div className="filter-actions">
        <button className="btn btn-outline btn-sm btn-block" onClick={onClear}>
          Clear all{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
      </div>
    </aside>
  );
}
