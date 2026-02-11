import { useState } from "react";
import { useApp, ScoringItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Save, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const [sheetUrl, setSheetUrl] = useState(state.settings.sheetUrl);

  // New Item Form State
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemType, setNewItemType] = useState<ScoringItem["type"]>("score");
  const [newItemMin, setNewItemMin] = useState("0");
  const [newItemMax, setNewItemMax] = useState("99");

  const handleSaveSettings = () => {
    dispatch({ type: "UPDATE_SETTINGS", payload: { sheetUrl } });
    toast({ title: "設定已儲存", description: "Google Script URL 已更新。" });
  };

  const handleAddItem = () => {
    if (!newItemLabel) return;
    
    const newItem: ScoringItem = {
      id: newItemLabel.toLowerCase().replace(/\s+/g, "_") + "_" + Math.floor(Math.random() * 1000),
      label: newItemLabel,
      type: newItemType,
      min: (newItemType === "score" || newItemType === "manual_score") ? parseInt(newItemMin) : undefined,
      max: (newItemType === "score" || newItemType === "manual_score") ? parseInt(newItemMax) : undefined,
      order: state.schema.length,
    };

    dispatch({ type: "ADD_SCHEMA_ITEM", payload: newItem });
    setNewItemLabel("");
    toast({ title: "項目已新增", description: `${newItemLabel} 已加入評分結構。` });
  };

  const handleDeleteItem = (id: string) => {
    dispatch({ type: "REMOVE_SCHEMA_ITEM", payload: id });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <h1 className="text-3xl font-display font-bold text-primary">SYSTEM SETTINGS</h1>

      {/* Google Sheets Integration */}
      <Card className="tech-border bg-card/50">
        <CardHeader>
          <CardTitle>數據同步設定</CardTitle>
          <CardDescription>將此應用程式連結至 Google 試算表。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="sheet-url">Google Apps Script 部署 URL</Label>
            <div className="flex gap-2">
              <Input
                id="sheet-url"
                placeholder="https://script.google.com/macros/s/..."
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="bg-background/50 font-mono text-sm"
              />
              <Button onClick={handleSaveSettings}>
                <Save className="w-4 h-4 mr-2" /> 儲存
              </Button>
            </div>
            <div className="p-4 bg-muted/20 rounded border border-muted-foreground/20 text-xs space-y-2">
              <p className="font-bold">設定教學：</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>開啟 Google 試算表，進入「擴充功能」{">"}「Apps Script」。</li>
                <li>貼上 doGet(e) 與 doPost(e) 的處理程式碼。</li>
                <li>點擊「部署」{">"}「新部署」，選擇「網頁應用程式」。</li>
                <li>存取權限設為「任何人」，部署後複製網址貼至上方。</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Schema Editor */}
      <Card className="tech-border bg-card/50">
        <CardHeader>
          <CardTitle>評分項目自定義</CardTitle>
          <CardDescription>設定要在比賽中蒐集的數據欄位。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-end p-4 border border-primary/20 rounded-md bg-primary/5">
            <div className="grid gap-2 flex-1">
              <Label>項目名稱</Label>
              <Input 
                value={newItemLabel} 
                onChange={(e) => setNewItemLabel(e.target.value)} 
                placeholder="例如：自動階段得分"
              />
            </div>
            <div className="grid gap-2 w-full md:w-[200px]">
              <Label>計分方式</Label>
              <Select value={newItemType} onValueChange={(v: any) => setNewItemType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">分數 (+/- 按鈕)</SelectItem>
                  <SelectItem value="manual_score">分數 (直接輸入)</SelectItem>
                  <SelectItem value="grade">評級 (S-F 級)</SelectItem>
                  <SelectItem value="boolean">是否開關 (Yes/No)</SelectItem>
                  <SelectItem value="text">文字筆記</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(newItemType === "score" || newItemType === "manual_score") && (
              <>
                 <div className="grid gap-2 w-[80px]">
                   <Label>最小值</Label>
                   <Input type="number" value={newItemMin} onChange={(e) => setNewItemMin(e.target.value)} />
                 </div>
                 <div className="grid gap-2 w-[80px]">
                   <Label>最大值</Label>
                   <Input type="number" value={newItemMax} onChange={(e) => setNewItemMax(e.target.value)} />
                 </div>
              </>
            )}

            <Button onClick={handleAddItem} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> 新增項目
            </Button>
          </div>

          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名稱</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>細節</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.schema.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.label}</TableCell>
                    <TableCell className="font-mono text-xs uppercase text-muted-foreground">{item.type}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {(item.type === "score" || item.type === "manual_score") && `範圍: ${item.min} - ${item.max}`}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-xs text-muted-foreground font-mono pt-10">
        FRC SCOUT MASTER // BUILD 2026.02.11 // RUNNING ON GITHUB PAGES ARCHITECTURE
      </div>
    </div>
  );
}
