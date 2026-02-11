import { useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

export default function TeamView() {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get unique teams
  const teams = Array.from(new Set(state.matches.map(m => m.teamNumber))).sort((a, b) => parseInt(a) - parseInt(b));
  
  const filteredTeams = teams.filter(t => t.includes(searchTerm));
  
  const selectedTeam = searchTerm && teams.includes(searchTerm) ? searchTerm : null;

  // Compute Stats for Selected Team
  const teamMatches = selectedTeam 
    ? state.matches.filter(m => m.teamNumber === selectedTeam).sort((a, b) => parseInt(a.matchNumber) - parseInt(b.matchNumber))
    : [];

  // Calculate Averages
  const averages = teamMatches.length > 0 ? state.schema.filter(i => i.type === "score").map(item => {
    const sum = teamMatches.reduce((acc, m) => acc + (Number(m.data[item.id]) || 0), 0);
    return {
      subject: item.label,
      A: (sum / teamMatches.length).toFixed(1),
      fullMark: item.max || 10
    };
  }) : [];

  return (
    <div className="space-y-6 h-full">
       <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search Team Number..." 
            className="pl-9 h-12 text-lg font-mono bg-card/50 border-primary/30 focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {selectedTeam ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-display font-bold text-primary">TEAM {selectedTeam}</h2>
            <div className="text-muted-foreground font-mono">{teamMatches.length} Matches Played</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Radar Chart for Performance Profile */}
            <Card className="tech-border bg-card/50">
              <CardHeader>
                <CardTitle>PERFORMANCE PROFILE</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {averages.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={averages}>
                      <PolarGrid stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                      <Radar
                        name={selectedTeam}
                        dataKey="A"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.4}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : <div className="flex justify-center items-center h-full text-muted-foreground">Not enough data</div>}
              </CardContent>
            </Card>

            {/* Match History List */}
            <Card className="tech-border bg-card/50 flex flex-col">
              <CardHeader>
                <CardTitle>MATCH HISTORY</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead className="w-[80px]">Match</TableHead>
                       <TableHead>Scout</TableHead>
                       <TableHead className="text-right">Score</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {teamMatches.map(match => {
                        // Calculate total score roughly
                        const scoreSum = state.schema.reduce((acc, item) => {
                          return item.type === "score" ? acc + (Number(match.data[item.id]) || 0) : acc;
                        }, 0);
                        
                        return (
                          <TableRow key={match.id}>
                            <TableCell className="font-mono font-bold">{match.matchNumber}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">{match.scoutName}</TableCell>
                            <TableCell className="text-right font-mono font-bold text-primary">{scoreSum}</TableCell>
                          </TableRow>
                        );
                     })}
                   </TableBody>
                 </Table>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Data View */}
          <Card className="tech-border bg-card/50">
            <CardHeader>
              <CardTitle>DETAILED METRICS</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="scores">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                  <TabsTrigger value="scores">Scores</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="scores" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {state.schema.filter(i => i.type === "score" || i.type === "grade").map(item => (
                       <Card key={item.id} className="bg-background/40 border-primary/20">
                         <CardHeader className="pb-2">
                           <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                         </CardHeader>
                         <CardContent>
                           <div className="text-2xl font-mono font-bold">
                             {item.type === "score" 
                               ? (teamMatches.reduce((acc, m) => acc + (Number(m.data[item.id]) || 0), 0) / (teamMatches.length || 1)).toFixed(1)
                               : "N/A" // Grade average logic complicated, skipping for brevity
                             }
                             <span className="text-xs font-sans text-muted-foreground ml-2 font-normal">AVG</span>
                           </div>
                         </CardContent>
                       </Card>
                     ))}
                  </div>
                </TabsContent>
                <TabsContent value="notes">
                   <div className="space-y-2">
                     {teamMatches.map(match => {
                       const noteItems = state.schema.filter(i => i.type === "text" && match.data[i.id]);
                       if (noteItems.length === 0) return null;
                       return (
                         <div key={match.id} className="p-3 rounded bg-muted/30 border border-border">
                           <div className="font-mono text-xs text-primary mb-1">Match {match.matchNumber}</div>
                           {noteItems.map(item => (
                             <div key={item.id} className="text-sm">
                               <span className="font-bold text-muted-foreground mr-2">{item.label}:</span>
                               {match.data[item.id]}
                             </div>
                           ))}
                         </div>
                       );
                     })}
                   </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredTeams.map(team => (
            <Button
              key={team}
              variant="outline"
              className="h-20 text-2xl font-mono border-primary/30 hover:bg-primary/20 hover:text-primary hover:border-primary transition-all"
              onClick={() => setSearchTerm(team)}
            >
              {team}
            </Button>
          ))}
          {filteredTeams.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted-foreground font-mono">
              NO TEAMS FOUND
            </div>
          )}
        </div>
      )}
    </div>
  );
}
