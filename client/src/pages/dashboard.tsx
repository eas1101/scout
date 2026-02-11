import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Trophy, Zap } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function Dashboard() {
  const { state } = useApp();
  const { matches, schema } = state;

  // Calculate quick stats
  const totalMatches = matches.length;
  const uniqueTeams = new Set(matches.map((m) => m.teamNumber)).size;
  const totalPointsRecorded = matches.reduce((acc, m) => {
    // Simple sum of all numerical fields for a rough "activity" metric
    let points = 0;
    Object.entries(m.data).forEach(([key, val]) => {
      if (typeof val === "number") points += val;
    });
    return acc + points;
  }, 0);

  // Prepare chart data: Average score per match number (trend)
  const matchesSorted = [...matches].sort((a, b) => parseInt(a.matchNumber) - parseInt(b.matchNumber));
  const recentActivity = matchesSorted.slice(-10).map((m) => {
    const scoreSum = Object.entries(m.data).reduce((acc, [k, v]) => {
      const item = schema.find((i) => i.id === k);
      return item?.type === "score" ? acc + Number(v) : acc;
    }, 0);
    return {
      name: `M${m.matchNumber}`,
      score: scoreSum,
      team: m.teamNumber,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-200">
          MISSION CONTROL
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          SYSTEM ONLINE
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="總比賽場次"
          value={totalMatches}
          icon={Activity}
          description="RECORDED MATCHES"
        />
        <StatCard
          title="已蒐集隊伍"
          value={uniqueTeams}
          icon={Users}
          description="UNIQUE TEAMS"
        />
        <StatCard
          title="數據點總數"
          value={totalPointsRecorded}
          icon={Zap}
          description="DATA POINTS"
        />
        <StatCard
          title="系統狀態"
          value="ACTIVE"
          icon={Trophy}
          description="READY FOR INPUT"
          textClass="text-green-500"
        />
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 tech-border bg-card/50">
          <CardHeader>
            <CardTitle className="font-display tracking-wide">近期比賽得分趨勢</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {recentActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--primary))",
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground font-mono">
                NO DATA AVAILABLE
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="tech-border bg-card/50">
          <CardHeader>
            <CardTitle className="font-display tracking-wide">快速操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {/* Quick Actions Placeholder */}
             <div className="p-4 rounded border border-dashed border-muted-foreground/30 text-center text-sm text-muted-foreground">
                快捷鍵: <br/>
                [N] 新增比賽 <br/>
                [S] 搜尋隊伍
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  textClass = "text-foreground",
}: {
  title: string;
  value: string | number;
  icon: any;
  description: string;
  textClass?: string;
}) {
  return (
    <Card className="tech-border hover:bg-card/80 transition-colors group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground font-sans">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold font-mono ${textClass}`}>{value}</div>
        <p className="text-xs text-muted-foreground font-mono mt-1 opacity-70">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
