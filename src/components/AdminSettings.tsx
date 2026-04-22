import { useState, useEffect } from 'react';
import { Save, Clock, Mail, Phone, MapPin, Building } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { useAuthFetch } from '../hooks/useAuthFetch';

interface RestaurantSettings {
  restaurantName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  emailTemplate: string;
  smsTemplate: string;
}

interface OperatingHours {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

const defaultHours: OperatingHours[] = [
  { day: 'Monday', openTime: '11:00', closeTime: '22:00', isClosed: false },
  { day: 'Tuesday', openTime: '11:00', closeTime: '22:00', isClosed: false },
  { day: 'Wednesday', openTime: '11:00', closeTime: '22:00', isClosed: false },
  { day: 'Thursday', openTime: '11:00', closeTime: '22:00', isClosed: false },
  { day: 'Friday', openTime: '11:00', closeTime: '23:00', isClosed: false },
  { day: 'Saturday', openTime: '11:00', closeTime: '23:00', isClosed: false },
  { day: 'Sunday', openTime: '10:00', closeTime: '21:00', isClosed: false }
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<RestaurantSettings>({
    restaurantName: 'Aura Dining',
    email: 'hello@auradining.vn',
    phone: '(+84) 236 123 4567',
    address: '15 Đ. 2 Tháng 9',
    city: 'Đà Nẵng',
    state: 'Việt Nam',
    zipCode: '',
    description: 'Trải nghiệm ẩm thực tinh tế giữa lòng Đà Nẵng. Nguyên liệu tươi, gia vị bản địa và dịch vụ tận tâm.',
    emailTemplate: `Kính chào {customerName},

Cảm ơn bạn đã đặt bàn tại {restaurantName}!

Chi tiết đặt bàn:
- Ngày: {date}
- Giờ: {time}
- Số khách: {guests} khách
- Vị trí ngồi: {diningPreference}

Chúng tôi rất mong được phục vụ bạn.

Trân trọng,
Đội ngũ {restaurantName}`,
    smsTemplate: 'Aura Dining xin xác nhận bàn của {customerName} vào {date} lúc {time} cho {guests} khách. Hẹn gặp bạn!'
  });

  const [hours, setHours] = useState<OperatingHours[]>(defaultHours);
  const [isLoading, setIsLoading] = useState(false);
  const authFetch = useAuthFetch();

  useEffect(() => {
    fetchSettings();
  }, [authFetch]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch('/settings');

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
        if (data.hours) {
          setHours(data.hours);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch('/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ settings, hours })
      });

      if (response.ok) {
        toast.success('Lưu cài đặt thành công!');
      } else {
        toast.error('Lưu cài đặt thất bại');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Lỗi khi lưu cài đặt');
    } finally {
      setIsLoading(false);
    }
  };

  const updateHour = (index: number, field: keyof OperatingHours, value: string | boolean) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], [field]: value };
    setHours(newHours);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Cài đặt nhà hàng</h1>
        <p className="text-gray-600">Cấu hình thông tin nhà hàng và cài đặt hệ thống</p>
      </div>

      <div className="space-y-6">
        {/* Restaurant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-600" />
              Thông tin nhà hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="restaurantName">Tên nhà hàng</Label>
                <Input
                  id="restaurantName"
                  value={settings.restaurantName}
                  onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Điện thoại
                </Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Địa chỉ đường
                </Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="city">Thành phố</Label>
                <Input
                  id="city"
                  value={settings.city}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state">Tỉnh/Thành</Label>
                  <Input
                    id="state"
                    value={settings.state}
                    onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Mã bưu điện</Label>
                  <Input
                    id="zipCode"
                    value={settings.zipCode}
                    onChange={(e) => setSettings({ ...settings, zipCode: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Mô tả nhà hàng</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Giờ mở cửa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hours.map((hour, index) => (
                <div key={hour.day}>
                  <div className="flex items-center gap-4">
                    <div className="w-28">
                      <Label>{hour.day === 'Monday' ? 'Thứ 2' : hour.day === 'Tuesday' ? 'Thứ 3' : hour.day === 'Wednesday' ? 'Thứ 4' : hour.day === 'Thursday' ? 'Thứ 5' : hour.day === 'Friday' ? 'Thứ 6' : hour.day === 'Saturday' ? 'Thứ 7' : 'Chủ nhật'}</Label>
                    </div>
                    {hour.isClosed ? (
                      <div className="flex-1 flex items-center gap-4">
                        <span className="text-gray-500">Đóng cửa</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateHour(index, 'isClosed', false)}
                        >
                          Đặt giờ
                        </Button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center gap-4">
                        <Input
                          type="time"
                          value={hour.openTime}
                          onChange={(e) => updateHour(index, 'openTime', e.target.value)}
                          className="w-32"
                        />
                        <span className="text-gray-500">đến</span>
                        <Input
                          type="time"
                          value={hour.closeTime}
                          onChange={(e) => updateHour(index, 'closeTime', e.target.value)}
                          className="w-32"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateHour(index, 'isClosed', true)}
                        >
                          Đánh dấu đóng cửa
                        </Button>
                      </div>
                    )}
                  </div>
                  {index < hours.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Email Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-600" />
              Mẫu email xác nhận
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="emailTemplate">Mẫu email</Label>
                <Textarea
                  id="emailTemplate"
                  value={settings.emailTemplate}
                  onChange={(e) => setSettings({ ...settings, emailTemplate: e.target.value })}
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Biến có sẵn: {'{customerName}'}, {'{restaurantName}'}, {'{date}'}, {'{time}'}, {'{guests}'}, {'{diningPreference}'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMS Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-amber-600" />
              Mẫu SMS xác nhận
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="smsTemplate">Mẫu SMS (tối đa 160 ký tự)</Label>
              <Textarea
                id="smsTemplate"
                value={settings.smsTemplate}
                onChange={(e) => setSettings({ ...settings, smsTemplate: e.target.value })}
                rows={3}
                maxLength={160}
                className="font-mono text-sm"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Biến có sẵn: {'{customerName}'}, {'{restaurantName}'}, {'{date}'}, {'{time}'}, {'{guests}'}
                </p>
                <p className="text-xs text-gray-500">
                  {settings.smsTemplate.length}/160 ký tự
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4 pb-8">
          <Button
            onClick={fetchSettings}
            variant="outline"
            disabled={isLoading}
          >
            Đặt lại thay đổi
          </Button>
          <Button
            onClick={handleSaveSettings}
            className="bg-amber-600 hover:bg-amber-700"
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Đang lưu...' : 'Lưu tất cả cài đặt'}
          </Button>
        </div>
      </div>
    </div>
  );
}
