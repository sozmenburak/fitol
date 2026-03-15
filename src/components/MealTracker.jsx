import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Search, Plus, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getToday } from '../utils/storage';
import { foodDatabase, mealPlan, dailyTargets } from '../data/foods';
import { playSuccessSound, playClickSound } from '../utils/alarmSystem';

const categories = [
  { id: 'all', label: 'Tümü' },
  { id: 'kahvaltı', label: 'Kahvaltı' },
  { id: 'et', label: 'Et' },
  { id: 'balık', label: 'Balık' },
  { id: 'baklagil', label: 'Baklagil' },
  { id: 'süt', label: 'Süt Ürünü' },
  { id: 'tahıl', label: 'Tahıl' },
  { id: 'sebze', label: 'Sebze' },
  { id: 'meyve', label: 'Meyve' },
  { id: 'kuruyemiş', label: 'Kuruyemiş' },
  { id: 'yöresel', label: 'Yöresel' },
  { id: 'çorba', label: 'Çorba' },
  { id: 'hamurişi', label: 'Hamur İşi' },
  { id: 'fastfood', label: 'Fast Food' },
  { id: 'atıştırmalık', label: 'Atıştırmalık' },
  { id: 'tatlı', label: 'Tatlı' },
  { id: 'içecek', label: 'İçecek' },
  { id: 'sos', label: 'Sos' },
];

const PAGE_SIZE = 30;

export default function MealTracker({ data, addMeal, removeMeal, addWater }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCustom, setShowCustom] = useState(false);
  const [customFood, setCustomFood] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', portion: '' });
  const [quantity, setQuantity] = useState({});
  const [showAllMeals, setShowAllMeals] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const today = getToday();
  const todayMeals = data.mealLog[today] || [];
  const waterToday = data.waterLog[today] || 0;

  const totalCalories = todayMeals.reduce((sum, m) => sum + (m.calories * (m.quantity || 1)), 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + (m.protein * (m.quantity || 1)), 0);
  const totalCarbs = todayMeals.reduce((sum, m) => sum + (m.carbs * (m.quantity || 1)), 0);
  const totalFat = todayMeals.reduce((sum, m) => sum + (m.fat * (m.quantity || 1)), 0);
  const isOver = totalCalories > dailyTargets.calories;

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return foodDatabase.filter(f => {
      const matchCat = selectedCategory === 'all' || f.category === selectedCategory;
      if (!matchCat) return false;
      if (!term) return true;
      return f.name.toLowerCase().includes(term);
    });
  }, [searchTerm, selectedCategory]);

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleAdd = (food) => {
    const qty = quantity[food.id] || 1;
    addMeal({
      foodId: food.id, name: food.name,
      calories: food.calories, protein: food.protein,
      carbs: food.carbs, fat: food.fat,
      portion: food.portion, quantity: qty,
    });
    playSuccessSound();
    setQuantity(p => ({ ...p, [food.id]: 1 }));
  };

  const handleAddCustom = () => {
    if (!customFood.name || !customFood.calories) return;
    addMeal({
      foodId: `c_${Date.now()}`, name: customFood.name,
      calories: +customFood.calories, protein: +customFood.protein || 0,
      carbs: +customFood.carbs || 0, fat: +customFood.fat || 0,
      portion: customFood.portion || '1 porsiyon', quantity: 1,
    });
    playSuccessSound();
    setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '', portion: '' });
    setShowCustom(false);
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setVisibleCount(PAGE_SIZE);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className={isOver ? 'border-destructive/40' : ''}>
        <CardHeader>
          <CardTitle>Günlük Özet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className={`text-3xl font-semibold tabular-nums ${isOver ? 'text-destructive' : ''}`}>{totalCalories}</span>
            <span className="text-sm text-muted-foreground">/ {dailyTargets.calories} kcal</span>
          </div>
          <Progress value={totalCalories} max={dailyTargets.calories} indicatorClassName={isOver ? 'bg-destructive' : ''} />
          {isOver && <p className="text-xs text-destructive mt-2">Kalori limitini {totalCalories - dailyTargets.calories} kcal aştın.</p>}

          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Protein', value: totalProtein, max: dailyTargets.protein, unit: 'g' },
              { label: 'Karbonhidrat', value: totalCarbs, max: dailyTargets.carbs, unit: 'g' },
              { label: 'Yağ', value: totalFat, max: dailyTargets.fat, unit: 'g' },
            ].map(m => (
              <div key={m.label}>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-sm font-medium tabular-nums">
                  {Math.round(m.value)}<span className="text-muted-foreground font-normal">/{m.max}{m.unit}</span>
                </p>
                <Progress value={m.value} max={m.max} className="mt-1 h-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Water */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Su</CardTitle>
            <span className="text-sm font-medium tabular-nums">
              {(waterToday / 1000).toFixed(1)}L
              <span className="text-muted-foreground font-normal"> / {dailyTargets.water / 1000}L</span>
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={waterToday} max={dailyTargets.water} indicatorClassName="bg-chart-2" className="mb-3" />
          <div className="flex gap-2">
            {[250, 500, 750].map(ml => (
              <Button key={ml} variant="outline" size="sm" className="flex-1" onClick={() => { addWater(ml); playClickSound(); }}>
                +{ml}ml
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meal Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Öğün Önerileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {Object.entries(mealPlan).map(([key, meal], i, arr) => (
              <div key={key}>
                <div className="py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{meal.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{meal.time} · {meal.targetCalories} kcal</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {meal.suggestions[new Date().getDate() % meal.suggestions.length]}
                  </p>
                </div>
                {i < arr.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Log */}
      {todayMeals.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bugün Yediklerin ({todayMeals.length})</CardTitle>
              {todayMeals.length > 5 && (
                <Button variant="ghost" size="sm" onClick={() => setShowAllMeals(!showAllMeals)}>
                  {showAllMeals ? 'Daralt' : 'Tümü'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {(showAllMeals ? todayMeals : todayMeals.slice(-5)).map((meal, i, arr) => (
                <div key={meal.id}>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{meal.name}</p>
                      <p className="text-xs text-muted-foreground">
                        x{meal.quantity || 1} · {meal.portion}
                        <span className="ml-2">P:{Math.round(meal.protein * (meal.quantity || 1))}g</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className="text-sm tabular-nums font-medium">{meal.calories * (meal.quantity || 1)}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { removeMeal(meal.id); playClickSound(); }}>
                        <Trash2 size={14} className="text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                  {i < arr.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Food */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Yemek Ekle</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowCustom(!showCustom)}>
              {showCustom ? 'Listeden Seç' : 'Manuel Ekle'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCustom ? (
            <div className="space-y-3">
              <Input placeholder="Yemek adı" value={customFood.name} onChange={e => setCustomFood(p => ({ ...p, name: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Kalori" value={customFood.calories} onChange={e => setCustomFood(p => ({ ...p, calories: e.target.value }))} />
                <Input type="number" placeholder="Protein (g)" value={customFood.protein} onChange={e => setCustomFood(p => ({ ...p, protein: e.target.value }))} />
                <Input type="number" placeholder="Karbo (g)" value={customFood.carbs} onChange={e => setCustomFood(p => ({ ...p, carbs: e.target.value }))} />
                <Input type="number" placeholder="Yağ (g)" value={customFood.fat} onChange={e => setCustomFood(p => ({ ...p, fat: e.target.value }))} />
              </div>
              <Input placeholder="Porsiyon (ör: 100g)" value={customFood.portion} onChange={e => setCustomFood(p => ({ ...p, portion: e.target.value }))} />
              <Button className="w-full" onClick={handleAddCustom}>Ekle</Button>
            </div>
          ) : (
            <>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                <Input
                  placeholder="Yemek ara... (1036 yemek)"
                  value={searchTerm}
                  onChange={e => handleSearch(e.target.value)}
                  className="pl-9"
                />
                {searchTerm && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleSearch('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 -mx-1 px-1 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap cursor-pointer transition-colors shrink-0 ${
                      selectedCategory === cat.id
                        ? 'bg-foreground text-background font-medium'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">
                  {filtered.length} sonuç
                  {selectedCategory !== 'all' && ` · ${categories.find(c => c.id === selectedCategory)?.label}`}
                </p>
              </div>

              <div className="space-y-0 max-h-[400px] overflow-y-auto">
                {visibleItems.map((food, i) => (
                  <div key={food.id}>
                    <div className="flex items-center gap-2 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{food.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {food.portion} · P:{food.protein}g K:{food.carbs}g Y:{food.fat}g
                        </p>
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground shrink-0">{food.calories}</span>
                      <Input
                        type="number" min="1" max="20"
                        value={quantity[food.id] || 1}
                        onChange={e => setQuantity(p => ({ ...p, [food.id]: parseInt(e.target.value) || 1 }))}
                        className="w-14 h-7 text-center text-xs"
                      />
                      <Button size="icon" className="h-7 w-7 shrink-0" onClick={() => handleAdd(food)}>
                        <Plus size={14} />
                      </Button>
                    </div>
                    {i < visibleItems.length - 1 && <Separator />}
                  </div>
                ))}

                {hasMore && (
                  <Button
                    variant="ghost"
                    className="w-full mt-2 text-xs"
                    onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                  >
                    <ChevronDown size={14} />
                    Daha fazla göster ({filtered.length - visibleCount} kaldı)
                  </Button>
                )}

                {filtered.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Sonuç bulunamadı. Manuel eklemeyi dene.
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
