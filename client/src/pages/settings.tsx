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
import { Trash2, Plus, Save } from "lucide-react";
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
    toast({ title: "Settings Saved", description: "Google Sheet URL updated." });
  };

  const handleAddItem = () => {
    if (!newItemLabel) return;
    
    const newItem: ScoringItem = {
      id: newItemLabel.toLowerCase().replace(/\s+/g, "_") + "_" + Math.floor(Math.random() * 1000),
      label: newItemLabel,
      type: newItemType,
      min: newItemType === "score" ? parseInt(newItemMin) : undefined,
      max: newItemType === "score" ? parseInt(newItemMax) : undefined,
      order: state.schema.length,
    };

    dispatch({ type: "ADD_SCHEMA_ITEM", payload: newItem });
    setNewItemLabel("");
    toast({ title: "Item Added", description: `${newItemLabel} added to scoring schema.` });
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
          <CardTitle>DATA INTEGRATION</CardTitle>
          <CardDescription>Connect to Google Sheets for cloud storage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="sheet-url">Google Sheet / Script URL</Label>
            <div className="flex gap-2">
              <Input
                id="sheet-url"
                placeholder="https://script.google.com/macros/s/..."
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="bg-background/50 font-mono text-sm"
              />
              <Button onClick={handleSaveSettings}>
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              * Note: This requires a Google Apps Script deployed as a Web App to receive POST requests.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Schema Editor */}
      <Card className="tech-border bg-card/50">
        <CardHeader>
          <CardTitle>SCORING SCHEMA</CardTitle>
          <CardDescription>Customize what data you collect during matches.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-end p-4 border border-primary/20 rounded-md bg-primary/5">
            <div className="grid gap-2 flex-1">
              <Label>Label</Label>
              <Input 
                value={newItemLabel} 
                onChange={(e) => setNewItemLabel(e.target.value)} 
                placeholder="e.g., Coral Scored L1"
              />
            </div>
            <div className="grid gap-2 w-full md:w-[150px]">
              <Label>Type</Label>
              <Select value={newItemType} onValueChange={(v: any) => setNewItemType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score (Num)</SelectItem>
                  <SelectItem value="grade">Grade (S-F)</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newItemType === "score" && (
              <>
                 <div className="grid gap-2 w-[80px]">
                   <Label>Min</Label>
                   <Input type="number" value={newItemMin} onChange={(e) => setNewItemMin(e.target.value)} />
                 </div>
                 <div className="grid gap-2 w-[80px]">
                   <Label>Max</Label>
                   <Input type="number" value={newItemMax} onChange={(e) => setNewItemMax(e.target.value)} />
                 </div>
              </>
            )}

            <Button onClick={handleAddItem} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </div>

          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.schema.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.label}</TableCell>
                    <TableCell className="font-mono text-xs uppercase text-muted-foreground">{item.type}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.type === "score" && `Range: ${item.min} - ${item.max}`}
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
