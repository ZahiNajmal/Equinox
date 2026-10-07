import React from 'react';

export default function MapCard({ country, onAsk }) {
  if (!country) return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="text-sm text-gray-500">Select a country on the map to see details.</p>
    </div>
  );
  return (
    <div className="bg-white rounded-lg shadow p-4 w-80">
      <h4 className="font-semibold">{country.name} ({country.code})</h4>
      <p className="text-sm text-gray-600">Population: {country.population.toLocaleString()}</p>
      <p className="text-sm text-gray-600">Region: {country.region}</p>
      <div className="mt-3 flex gap-2">
        <button className="px-3 py-1 bg-primary text-white rounded" onClick={() => onAsk(country)}>Ask Mentor about this country</button>
      </div>
    </div>
  );
}