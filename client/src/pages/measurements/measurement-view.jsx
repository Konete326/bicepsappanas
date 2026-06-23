import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function MeasurementView() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/measurements">
          <Button variant="outline" size="sm" className="text-stone-500">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
          </Button>
        </Link>
      </div>
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold font-outfit uppercase">Member Measurements</h1>
          <p className="text-stone-500">Coming Soon. (Member ID: {id})</p>
        </div>
      </div>
    </div>
  );
}
