import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle, Info, Navigation } from "lucide-react";

interface Station {
  id: string;
  name: string;
  address: string;
  district: string;
  officers: number;
  vehicles: number;
  status: string;
  // For map display
  lat?: number;
  lng?: number;
}

interface Hotspot {
  id: string;
  name: string;
  riskLevel: "high" | "medium" | "low";
  crimeType: string;
  // For map display
  lat: number;
  lng: number;
}

// Mock coordinates for The Gambia stations
const stationCoordinates: Record<string, { lat: number; lng: number }> = {
  "Banjul Central Police Station": { lat: 13.4557, lng: -16.5787 },
  "Serrekunda Police Station": { lat: 13.4382, lng: -16.6749 },
  "Bakau Police Station": { lat: 13.4784, lng: -16.6819 },
  "Brikama Police Station": { lat: 13.2809, lng: -16.651 },
  "Farafenni Police Station": { lat: 13.5667, lng: -15.6 },
};

// Mock hotspots for The Gambia
const mockHotspots: Hotspot[] = [
  {
    id: "1",
    name: "Serrekunda Market",
    riskLevel: "high",
    crimeType: "Theft",
    lat: 13.4382,
    lng: -16.6749,
  },
  {
    id: "2",
    name: "Banjul Ferry Terminal",
    riskLevel: "medium",
    crimeType: "Pickpocketing",
    lat: 13.4557,
    lng: -16.5787,
  },
  {
    id: "3",
    name: "Senegambia Strip",
    riskLevel: "high",
    crimeType: "Assault",
    lat: 13.4419,
    lng: -16.6945,
  },
  {
    id: "4",
    name: "Westfield Junction",
    riskLevel: "medium",
    crimeType: "Traffic Violations",
    lat: 13.4505,
    lng: -16.6781,
  },
  {
    id: "5",
    name: "Bakau Beach",
    riskLevel: "low",
    crimeType: "Theft",
    lat: 13.4784,
    lng: -16.6819,
  },
];

const MapView = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>(mockHotspots);
  const [isLoading, setIsLoading] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from("stations").select("*");

        if (error) throw error;

        if (data && data.length > 0) {
          // Add coordinates to stations for map display
          const stationsWithCoordinates = data.map((station) => {
            const coordinates = stationCoordinates[station.name] || {
              lat: 13.4557, // Default to Banjul coordinates
              lng: -16.5787,
            };
            return {
              ...station,
              lat: coordinates.lat,
              lng: coordinates.lng,
            };
          });
          setStations(stationsWithCoordinates);
        }
      } catch (error) {
        console.error("Error fetching stations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  const getRiskLevelColor = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Map View</h2>
          <p className="text-muted-foreground">
            Interactive map showing station locations and crime hotspots
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={showHotspots ? "default" : "outline"}
            onClick={() => setShowHotspots(true)}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Show Hotspots
          </Button>
          <Button
            variant={!showHotspots ? "default" : "outline"}
            onClick={() => setShowHotspots(false)}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Show Stations
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-hidden">
          <div className="relative w-full h-[600px] bg-gray-100 flex items-center justify-center">
            {/* This would be replaced with an actual map component */}
            <div className="absolute inset-0 bg-gray-200">
              {/* Map placeholder */}
              <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1563656157432-67560b52e9fa?w=800&q=80')] bg-cover bg-center opacity-50"></div>

              {/* Overlay for stations and hotspots */}
              <div className="absolute inset-0">
                {showHotspots
                  ? hotspots.map((hotspot) => (
                      <div
                        key={hotspot.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${((hotspot.lng + 16.7) / 1.2) * 100}%`,
                          top: `${((13.5 - hotspot.lat) / 0.3) * 100}%`,
                        }}
                      >
                        <div
                          className={`flex flex-col items-center cursor-pointer group`}
                        >
                          <AlertTriangle
                            className={`h-6 w-6 ${hotspot.riskLevel === "high" ? "text-red-500" : hotspot.riskLevel === "medium" ? "text-yellow-500" : "text-green-500"}`}
                          />
                          <div className="hidden group-hover:block absolute bottom-full mb-2 bg-white p-2 rounded shadow-lg z-10 w-48">
                            <div className="font-medium">{hotspot.name}</div>
                            <div className="text-sm">
                              Crime Type: {hotspot.crimeType}
                            </div>
                            <div className="mt-1">
                              <Badge
                                className={getRiskLevelColor(hotspot.riskLevel)}
                              >
                                {hotspot.riskLevel.charAt(0).toUpperCase() +
                                  hotspot.riskLevel.slice(1)}{" "}
                                Risk
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  : stations.map((station) => (
                      <div
                        key={station.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${(((station.lng || -16.7) + 16.7) / 1.2) * 100}%`,
                          top: `${((13.5 - (station.lat || 13.5)) / 0.3) * 100}%`,
                        }}
                      >
                        <div
                          className={`flex flex-col items-center cursor-pointer group`}
                        >
                          <MapPin
                            className={`h-6 w-6 ${station.status === "active" ? "text-blue-500" : station.status === "maintenance" ? "text-yellow-500" : "text-red-500"}`}
                          />
                          <div className="hidden group-hover:block absolute bottom-full mb-2 bg-white p-2 rounded shadow-lg z-10 w-48">
                            <div className="font-medium">{station.name}</div>
                            <div className="text-sm">{station.address}</div>
                            <div className="text-sm">
                              Officers: {station.officers} | Vehicles:{" "}
                              {station.vehicles}
                            </div>
                            <div className="mt-1">
                              <Badge
                                className={
                                  station.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : station.status === "maintenance"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }
                              >
                                {station.status.charAt(0).toUpperCase() +
                                  station.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>

              {/* Map controls */}
              <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                <Button variant="secondary" size="icon">
                  <Navigation className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span>Loading map data...</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crime Hotspots</CardTitle>
            <CardDescription>
              Areas with high crime activity in The Gambia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hotspots.map((hotspot) => (
                <div key={hotspot.id} className="p-3 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <AlertTriangle
                        className={`h-5 w-5 mr-2 mt-0.5 ${hotspot.riskLevel === "high" ? "text-red-500" : hotspot.riskLevel === "medium" ? "text-yellow-500" : "text-green-500"}`}
                      />
                      <div>
                        <h3 className="font-medium">{hotspot.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Crime Type: {hotspot.crimeType}
                        </p>
                      </div>
                    </div>
                    <Badge className={getRiskLevelColor(hotspot.riskLevel)}>
                      {hotspot.riskLevel.charAt(0).toUpperCase() +
                        hotspot.riskLevel.slice(1)}{" "}
                      Risk
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Station Coverage</CardTitle>
            <CardDescription>
              Police station coverage areas in The Gambia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stations.map((station) => (
                <div key={station.id} className="p-3 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <MapPin
                        className={`h-5 w-5 mr-2 mt-0.5 ${station.status === "active" ? "text-blue-500" : station.status === "maintenance" ? "text-yellow-500" : "text-red-500"}`}
                      />
                      <div>
                        <h3 className="font-medium">{station.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {station.district} District
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-right">
                      <div>{station.officers} Officers</div>
                      <div>{station.vehicles} Vehicles</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapView;
