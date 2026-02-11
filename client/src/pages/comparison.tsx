import { useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Comparison() {
  const { state } = useApp();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const allTeams = Array.from(new Set(state.matches.map((m) => m.teamNumber))).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  const toggleTeam = (team: string) => {
    if (selectedTeams.includes(team)) {
      setSelectedTeams(selectedTeams.filter((t) => t !== team));
    } else {
      if (selectedTeams.length >= 8) return; // Max 8 teams
      setSelectedTeams([...selectedTeams, team]);
    }
  };

  // Prepare comparison data
  // We need an array of objects like: { metric: "Auto Score", TeamA: 10, TeamB: 15, ... }
  const scoreItems = state.schema.filter((i) => i.type === "score");
  
  const chartData = scoreItems.map(item => {
    const row: any = { name: item.label };
    selectedTeams.forEach(team => {
      const teamMatches = state.matches.filter(m => m.teamNumber === team);
      const sum = teamMatches.reduce((acc, m) => acc + (Number(m.data[item.id]) || 0), 0);
      const avg = teamMatches.length ? (sum / teamMatches.length) : 0;
      row[team] = parseFloat(avg.toFixed(1));
    });
    return row;
  });

  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "#ff00ff",
    "#00ffff",
    "#ffff00"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-primary">TEAM COMPARISON</h1>
        <div className="text-sm font-mono text-muted-foreground">
          SELECTED: {selectedTeams.length} / 8
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Team Selector Sidebar */}
        <Card className="lg:col-span-1 tech-border bg-card/50 max-h-[calc(100vh-200px)] overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-sm">SELECT TEAMS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allTeams.map((team) => (
              <div key={team} className="flex items-center space-x-2">
                <Checkbox 
                  id={`team-${team}`} 
                  checked={selectedTeams.includes(team)}
                  onCheckedChange={() => toggleTeam(team)}
                  disabled={!selectedTeams.includes(team) && selectedTeams.length >= 8}
                />
                <Label 
                  htmlFor={`team-${team}`}
                  className="font-mono cursor-pointer flex-1"
                >
                  {team}
                </Label>
              </div>
            ))}
            {allTeams.length === 0 && (
                <div className="text-sm text-muted-foreground">No teams available. Add match data first.</div>
            )}
          </CardContent>
        </Card>

        {/* Charts Area */}
        <div className="lg:col-span-3 space-y-6">
          {selectedTeams.length > 0 ? (
            <Card className="tech-border bg-card/50">
              <CardHeader>
                <CardTitle>AVERAGE SCORES COMPARISON</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted)/0.2)'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    />
                    <Legend />
                    {selectedTeams.map((team, index) => (
                      <Bar key={team} dataKey={team} fill={colors[index % colors.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
             <div className="h-full flex items-center justify-center border-2 border-dashed border-muted rounded-lg p-10">
               <div className="text-center">
                 <h3 className="text-lg font-medium text-muted-foreground">Select teams to compare</h3>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
