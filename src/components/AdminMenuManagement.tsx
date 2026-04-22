import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, Star, Leaf, X, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { useAuthFetch } from '../hooks/useAuthFetch';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'starters' | 'mains' | 'desserts' | 'drinks';
  isVeg: boolean;
  isChefSpecial: boolean;
  isAvailable: boolean;
}

type AvailabilityFilter = 'all' | 'available' | 'unavailable';

export default function AdminMenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'starters' as 'starters' | 'mains' | 'desserts' | 'drinks',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true
  });

  const authFetch = useAuthFetch();

  useEffect(() => {
    fetchMenuItems();
  }, [authFetch]);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch('/menu');

      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Tải món ăn thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    try {
      const method = editingItem ? 'PUT' : 'POST';
      const endpoint = editingItem ? `/menu/${editingItem.id}` : '/menu';
      const response = await authFetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
          category: formData.category,
          isVeg: formData.isVeg,
          isChefSpecial: formData.isChefSpecial,
          isAvailable: formData.isAvailable
        })
      });

      if (response.ok) {
        toast.success(editingItem ? 'Cập nhật món ăn thành công' : 'Tạo món ăn thành công');
        setIsDialogOpen(false);
        resetForm();
        fetchMenuItems();
      } else {
        toast.error('Lưu món ăn thất bại');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Lỗi khi lưu món ăn');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa món ăn này?')) return;

    try {
      const response = await authFetch(`/menu/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Xóa món ăn thành công');
        fetchMenuItems();
      } else {
        toast.error('Xóa món ăn thất bại');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Lỗi khi xóa món ăn');
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const response = await authFetch(`/menu/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...item,
            isAvailable: !item.isAvailable
          })
      });

      if (response.ok) {
        toast.success(`${item.name} đã ${item.isAvailable ? 'đánh dấu không có sẵn' : 'đánh dấu có sẵn'}`);
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Cập nhật món ăn thất bại');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'starters',
      isVeg: true,
      isChefSpecial: false,
      isAvailable: true
    });
    setEditingItem(null);
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image,
      category: item.category,
      isVeg: item.isVeg,
      isChefSpecial: item.isChefSpecial,
      isAvailable: item.isAvailable
    });
    setIsDialogOpen(true);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability =
      availabilityFilter === 'all'
        ? true
        : availabilityFilter === 'available'
        ? item.isAvailable
        : !item.isAvailable;
    return matchesCategory && matchesSearch && matchesAvailability;
  });

  const getCategoryStats = (category: string) => {
    const items = category === 'all' ? menuItems : menuItems.filter(i => i.category === category);
    return {
      total: items.length,
      available: items.filter(i => i.isAvailable).length,
      special: items.filter(i => i.isChefSpecial).length
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Quản lý thực đơn</h1>
        <p className="text-gray-600">Thêm, chỉnh sửa và quản lý món ăn trong thực đơn nhà hàng</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tổng số món</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{menuItems.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Có sẵn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-green-600">
              {menuItems.filter(i => i.isAvailable).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Đặc biệt của đầu bếp</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-amber-600">
              {menuItems.filter(i => i.isChefSpecial).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Món chay</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-green-600">
              {menuItems.filter(i => i.isVeg).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Menu Item Button */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <Input
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={availabilityFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setAvailabilityFilter('all')}
          >
            Tất cả
          </Button>
          <Button
            variant={availabilityFilter === 'available' ? 'default' : 'outline'}
            onClick={() => setAvailabilityFilter('available')}
          >
            Có sẵn
          </Button>
          <Button
            variant={availabilityFilter === 'unavailable' ? 'default' : 'outline'}
            onClick={() => setAvailabilityFilter('unavailable')}
          >
            Hết hàng
          </Button>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm món ăn
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Tên món *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ví dụ: Pasta Nấm Truffle"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Mô tả *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả món ăn..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price">Giá (VND) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step="1000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="ví dụ: 150000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Danh mục *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starters">Khai vị</SelectItem>
                      <SelectItem value="mains">Món chính</SelectItem>
                      <SelectItem value="desserts">Tráng miệng</SelectItem>
                      <SelectItem value="drinks">Đồ uống</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="image">URL hình ảnh</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Để trống để sử dụng hình ảnh mặc định
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-green-600" />
                    <Label htmlFor="isVeg" className="cursor-pointer">Món chay</Label>
                  </div>
                  <Switch
                    id="isVeg"
                    checked={formData.isVeg}
                    onCheckedChange={(checked) => setFormData({ ...formData, isVeg: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-600" />
                    <Label htmlFor="isChefSpecial" className="cursor-pointer">Đặc biệt của đầu bếp</Label>
                  </div>
                  <Switch
                    id="isChefSpecial"
                    checked={formData.isChefSpecial}
                    onCheckedChange={(checked) => setFormData({ ...formData, isChefSpecial: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="isAvailable" className="cursor-pointer">Có sẵn để đặt</Label>
                  <Switch
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700">
                  <Save className="w-4 h-4 mr-2" />
                  {editingItem ? 'Cập nhật món' : 'Tạo món'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Menu Items */}
      <Card>
        <CardHeader>
          <CardTitle>Món ăn</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="all">
                Tất cả ({getCategoryStats('all').total})
              </TabsTrigger>
              <TabsTrigger value="starters">
                Khai vị ({getCategoryStats('starters').total})
              </TabsTrigger>
              <TabsTrigger value="mains">
                Món chính ({getCategoryStats('mains').total})
              </TabsTrigger>
              <TabsTrigger value="desserts">
                Tráng miệng ({getCategoryStats('desserts').total})
              </TabsTrigger>
              <TabsTrigger value="drinks">
                Đồ uống ({getCategoryStats('drinks').total})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeCategory} className="mt-0">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Đang tải món ăn...</div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Không tìm thấy món ăn nào. Thêm món đầu tiên để bắt đầu.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className={`overflow-hidden ${!item.isAvailable ? 'opacity-60' : ''}`}>
                      <div className="relative h-40">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          {item.isChefSpecial && (
                            <Badge className="bg-amber-600">
                              <Star className="w-3 h-3" />
                            </Badge>
                          )}
                          {item.isVeg ? (
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-green-600 rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-red-600 rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </div>
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive">Không có sẵn</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          <span className="text-amber-600">
                            {Number(item.price).toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                        <Badge variant="outline" className="mb-3 text-xs">
                          {item.category === 'mains' ? 'Món chính' : item.category === 'starters' ? 'Khai vị' : item.category === 'desserts' ? 'Tráng miệng' : 'Đồ uống'}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleAvailability(item)}
                            className="flex-1 text-xs"
                          >
                            {item.isAvailable ? 'Đánh dấu không có sẵn' : 'Đánh dấu có sẵn'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
