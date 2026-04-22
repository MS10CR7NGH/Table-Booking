import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { useAuthFetch } from '../hooks/useAuthFetch';

interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  location: 'indoor' | 'outdoor';
  isAvailable: boolean;
  description?: string;
}

export default function AdminTableManagement() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [totalCapacity, setTotalCapacity] = useState(50);

  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    location: 'indoor' as 'indoor' | 'outdoor',
    isAvailable: true,
    description: ''
  });

  const authFetch = useAuthFetch();

  useEffect(() => {
    fetchTables();
  }, [authFetch]);

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch('/tables');

      if (response.ok) {
        const data = await response.json();
        setTables(data.tables || []);
        setTotalCapacity(data.totalCapacity || 50);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Tải bàn thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tableNumber || !formData.capacity) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    try {
      const method = editingTable ? 'PUT' : 'POST';
      const endpoint = editingTable ? `/tables/${editingTable.id}` : '/tables';
      const response = await authFetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tableNumber: parseInt(formData.tableNumber),
          capacity: parseInt(formData.capacity),
          location: formData.location,
          isAvailable: formData.isAvailable,
          description: formData.description
        })
      });

      if (response.ok) {
        toast.success(editingTable ? 'Cập nhật bàn thành công' : 'Tạo bàn thành công');
        setIsDialogOpen(false);
        resetForm();
        fetchTables();
      } else {
        toast.error('Lưu bàn thất bại');
      }
    } catch (error) {
      console.error('Error saving table:', error);
      toast.error('Lỗi khi lưu bàn');
    }
  };

  const handleDelete = async (tableId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bàn này?')) return;

    try {
      const response = await authFetch(`/tables/${tableId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Xóa bàn thành công');
        fetchTables();
      } else {
        toast.error('Xóa bàn thất bại');
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error('Lỗi khi xóa bàn');
    }
  };

  const toggleAvailability = async (table: Table) => {
    try {
      const response = await authFetch(`/tables/${table.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...table,
            isAvailable: !table.isAvailable
          })
      });

      if (response.ok) {
        toast.success(`Bàn đã ${table.isAvailable ? 'vô hiệu hóa' : 'kích hoạt'}`);
        fetchTables();
      }
    } catch (error) {
      console.error('Error updating table:', error);
      toast.error('Cập nhật bàn thất bại');
    }
  };

  const updateTotalCapacity = async () => {
    try {
      const response = await authFetch('/settings/capacity', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ totalCapacity })
      });

      if (response.ok) {
        toast.success('Cập nhật sức chứa thành công');
      } else {
        toast.error('Cập nhật sức chứa thất bại');
      }
    } catch (error) {
      console.error('Error updating capacity:', error);
      toast.error('Lỗi khi cập nhật sức chứa');
    }
  };

  const resetForm = () => {
    setFormData({
      tableNumber: '',
      capacity: '',
      location: 'indoor',
      isAvailable: true,
      description: ''
    });
    setEditingTable(null);
  };

  const openEditDialog = (table: Table) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber.toString(),
      capacity: table.capacity.toString(),
      location: table.location,
      isAvailable: table.isAvailable,
      description: table.description || ''
    });
    setIsDialogOpen(true);
  };

  const availableTables = tables.filter(t => t.isAvailable).length;
  const totalSeats = tables.reduce((sum, t) => sum + (t.isAvailable ? t.capacity : 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Quản lý bàn</h1>
        <p className="text-gray-600">Cấu hình và quản lý bàn nhà hàng và sức chứa</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tổng số bàn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{tables.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bàn có sẵn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-green-600">{availableTables}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tổng số chỗ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{totalSeats}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sức chứa hệ thống</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(parseInt(e.target.value) || 0)}
                className="w-20"
              />
              <Button
                size="sm"
                onClick={updateTotalCapacity}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Table Button */}
      <div className="mb-6">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm bàn mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTable ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tableNumber">Số bàn *</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                  placeholder="ví dụ: 1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="capacity">Sức chứa *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="ví dụ: 4"
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Vị trí *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value: 'indoor' | 'outdoor') => 
                    setFormData({ ...formData, location: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indoor">Trong nhà</SelectItem>
                    <SelectItem value="outdoor">Ngoài trời</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Mô tả (Tùy chọn)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ví dụ: Cửa sổ, Góc riêng"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isAvailable">Có sẵn để đặt</Label>
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700">
                  <Save className="w-4 h-4 mr-2" />
                  {editingTable ? 'Cập nhật bàn' : 'Tạo bàn'}
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

      {/* Tables List */}
      <Card>
        <CardHeader>
          <CardTitle>Tất cả bàn</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Đang tải bàn...</div>
          ) : tables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có bàn nào được cấu hình. Thêm bàn đầu tiên để bắt đầu.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`border-2 rounded-lg p-4 ${
                    table.isAvailable
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg">Bàn {table.tableNumber}</h3>
                      <p className="text-sm text-gray-600">
                        {table.capacity} chỗ • {table.location === 'indoor' ? 'Trong nhà' : 'Ngoài trời'}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      table.isAvailable
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-400 text-white'
                    }`}>
                      {table.isAvailable ? 'Có sẵn' : 'Không có sẵn'}
                    </div>
                  </div>

                  {table.description && (
                    <p className="text-sm text-gray-600 mb-3">{table.description}</p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAvailability(table)}
                      className="flex-1"
                    >
                      {table.isAvailable ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(table)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(table.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
