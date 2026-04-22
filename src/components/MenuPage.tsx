import { useEffect, useMemo, useState, useCallback } from 'react';
import { Leaf, Star, Search, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { buildApiUrl } from '../utils/api/config';
import { toast } from 'sonner@2.0.3';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'starters' | 'mains' | 'desserts' | 'drinks';
  isVeg: boolean;
  isChefSpecial?: boolean;
};

const categories = [
  { key: 'starters', label: 'Khai vị' },
  { key: 'mains', label: 'Món chính' },
  { key: 'desserts', label: 'Tráng miệng' },
  { key: 'drinks', label: 'Đồ uống' }
] as const;

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMenu() {
      setIsLoading(true);
      try {
        const response = await fetch(buildApiUrl('/menu'));
        if (!response.ok) {
          throw new Error('Không thể tải thực đơn');
        }
        const data = await response.json();
        if (isMounted) {
          setMenuItems(data.items || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Không thể tải thực đơn';
          setError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  }, [menuItems, searchTerm, activeCategory]);

  const MenuItemCard = ({ item }: { item: MenuItem }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48 overflow-hidden">
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform hover:scale-110 duration-300"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            {item.isChefSpecial && (
              <Badge className="bg-amber-600 hover:bg-amber-700">
                <Star className="w-3 h-3 mr-1" />
                Đặc biệt
              </Badge>
            )}
          </div>
          <div className="absolute top-3 left-3">
            {item.isVeg ? (
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                <div className="w-5 h-5 border-2 border-green-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                <div className="w-5 h-5 border-2 border-red-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-900">{item.name}</h3>
            <span className="text-amber-600">
              {Number(item.price).toLocaleString('vi-VN')} VND
            </span>
          </div>
          <p className="text-sm text-gray-600">{item.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl mb-4">Thực đơn của chúng tôi</h1>
          <p className="text-xl text-gray-600 mb-8">
            Được chế biến với đam mê, phục vụ với sự xuất sắc
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <Input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Xóa tìm kiếm"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              Tìm thấy {filteredItems.length} món ăn phù hợp với "{searchTerm}"
            </p>
          )}
        </div>

        {/* Legend */}
        <div className="flex justify-center items-center gap-6 mb-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-green-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            </div>
            <span className="text-gray-600">Món chay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-red-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            </div>
            <span className="text-gray-600">Món mặn</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-600 text-amber-600" />
            <span className="text-gray-600">Đặc biệt</span>
          </div>
        </div>

        {/* Menu Tabs */}
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category.key} value={category.key}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {categories.map(category => {
              const items = filteredItems.filter(item => item.category === category.key);
              if (items.length === 0) return null;
              return (
                <div className="mb-12" key={category.key}>
                  <h2 className="text-3xl mb-6">{category.label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(item => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
              );
            })}
          </TabsContent>

          <TabsContent value="starters" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems
                .filter(item => item.category === 'starters')
                .map(item => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
            </div>
            {filteredItems.filter(item => item.category === 'starters').length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy món khai vị nào phù hợp.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="mains" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems
                .filter(item => item.category === 'mains')
                .map(item => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
            </div>
            {filteredItems.filter(item => item.category === 'mains').length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy món chính nào phù hợp.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="desserts" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems
                .filter(item => item.category === 'desserts')
                .map(item => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
            </div>
            {filteredItems.filter(item => item.category === 'desserts').length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy món tráng miệng nào phù hợp.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="drinks" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems
                .filter(item => item.category === 'drinks')
                .map(item => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
            </div>
            {filteredItems.filter(item => item.category === 'drinks').length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy đồ uống nào phù hợp.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Đang tải thực đơn...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        )}

        {!isLoading && !error && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không tìm thấy món ăn nào phù hợp với tìm kiếm của bạn.</p>
        </div>
        )}
      </div>
    </div>
  );
}
