import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Check, Utensils, Download, StickyNote } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Textarea } from './ui/textarea';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { buildApiUrl } from '../utils/api/config';

export default function BookingPage() {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('');
  const [diningPreference, setDiningPreference] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [availability, setAvailability] = useState<{
    available: boolean;
    availableSeats: number;
    totalCapacity: number;
    currentBookings: number;
  } | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Generate available time slots
  const timeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
    '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
    '9:00 PM', '9:30 PM', '10:00 PM'
  ];

  // Check availability when date and time change
  useEffect(() => {
    if (date && time) {
      checkAvailability();
    }
  }, [date, time]);

  const checkAvailability = async () => {
    if (!date || !time) return;
    
    setIsCheckingAvailability(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(
        buildApiUrl(`/availability/${dateStr}/${encodeURIComponent(time)}`)
      );

      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const getAvailabilityStatus = () => {
    if (!availability) return null;
    
    if (!availability.available) {
      return { status: 'unavailable', message: 'Đã hết chỗ vào thời điểm này' };
    } else if (availability.availableSeats <= 10) {
      return { status: 'limited', message: `Chỉ còn ${availability.availableSeats} chỗ` };
    } else {
      return { status: 'available', message: `Còn ${availability.availableSeats} chỗ trống` };
    }
  };

  const availabilityStatus = getAvailabilityStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !guests || !diningPreference || !name || !email || !phone) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Check if table is available
    if (availability && !availability.available) {
      toast.error('Xin lỗi, không còn bàn trống vào thời điểm này. Vui lòng chọn thời gian khác.');
      return;
    }

    try {
      const response = await fetch(
        buildApiUrl('/bookings'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            date: date.toISOString().split('T')[0],
            time,
            guests,
            diningPreference,
            note: note.trim()
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookingId(data.bookingId);
        setIsSubmitted(true);
        toast.success('Đặt bàn thành công! Vui lòng kiểm tra email để xem chi tiết.');
        
        // Simulate email notification
        setTimeout(() => {
          toast.info('Email xác nhận đã được gửi đến ' + email);
        }, 1000);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Đặt bàn thất bại');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Gửi đặt bàn thất bại. Vui lòng thử lại.');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const downloadImage = async () => {
    const summary = document.getElementById('booking-summary');
    if (!summary) return;

    const { toPng } = await import('html-to-image');
    try {
      const dataUrl = await toPng(summary);
    const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `AuraDining_Booking_${bookingId || Date.now()}.png`;
    link.click();
      toast.success('Đã tải ảnh chi tiết đặt bàn!');
    } catch (error) {
      console.error('Failed to download image', error);
      toast.error('Tải ảnh thất bại');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center" id="booking-summary">
              <CardContent className="p-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl mb-4">Đặt bàn thành công!</h1>
                <p className="text-gray-600 mb-6">
                  Cảm ơn bạn, {name}! Bàn của bạn đã được đặt.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                  <h3 className="mb-4">Chi tiết đặt bàn</h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-amber-600" />
                      <span>{date && formatDate(date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-3 text-amber-600" />
                      <span>{time}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-3 text-amber-600" />
                      <span>{guests} {parseInt(guests) === 1 ? 'Khách' : 'Khách'}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-3 text-amber-600" />
                      <span>{diningPreference === 'indoor' ? 'Trong nhà' : 'Ngoài trời'}</span>
                    </div>
                  {note && (
                    <div className="flex items-start">
                      <StickyNote className="w-5 h-5 mr-3 text-amber-600 mt-0.5" />
                      <span>{note}</span>
                    </div>
                  )}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-amber-800 mb-2">
                    Email xác nhận đã được gửi đến <strong>{email}</strong> và SMS đến <strong>{phone}</strong>
                  </p>
                  {bookingId && (
                    <p className="text-xs text-amber-700">
                      Mã đặt bàn: <strong>{bookingId}</strong>
                    </p>
                  )}
                </div>

                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => setIsSubmitted(false)}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Đặt bàn khác
                  </Button>
                  <Button 
                    onClick={downloadImage}
                    variant="outline"
                    className="border-amber-600 text-amber-600 hover:bg-amber-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Tải về
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl mb-4">Đặt bàn của bạn</h1>
          <p className="text-xl text-gray-600">
            Đặt bàn để trải nghiệm ẩm thực tại Aura Dining
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết đặt bàn</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <Label htmlFor="date" className="mb-2 block">Chọn ngày</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="w-full flex items-center justify-start px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>{date ? formatDate(date) : 'Chọn ngày'}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time and Guests */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="time" className="mb-2 block">Chọn giờ</Label>
                      <Select value={time} onValueChange={setTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giờ" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="guests" className="mb-2 block">Số lượng khách</Label>
                      <Select value={guests} onValueChange={setGuests}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn số khách" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'Khách' : 'Khách'}
                            </SelectItem>
                          ))}
                          <SelectItem value="9+">9+ Khách (Liên hệ chúng tôi)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Dining Preference */}
                  <div>
                    <Label className="mb-2 block">Sở thích chỗ ngồi</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setDiningPreference('indoor')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          diningPreference === 'indoor'
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        <Utensils className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                        <div className="text-sm">Trong nhà</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiningPreference('outdoor')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          diningPreference === 'outdoor'
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        <MapPin className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                        <div className="text-sm">Ngoài trời</div>
                      </button>
                    </div>
                  </div>

                  {/* Availability Indicator */}
                  {availabilityStatus && (
                    <div className={`p-4 rounded-lg ${
                      availabilityStatus.status === 'available' ? 'bg-green-50 border border-green-200' :
                      availabilityStatus.status === 'limited' ? 'bg-yellow-50 border border-yellow-200' :
                      availabilityStatus.status === 'unavailable' ? 'bg-red-50 border border-red-200' :
                      'bg-orange-50 border border-orange-200'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          availabilityStatus.status === 'available' ? 'bg-green-500' :
                          availabilityStatus.status === 'limited' ? 'bg-yellow-500' :
                          availabilityStatus.status === 'unavailable' ? 'bg-red-500' :
                          'bg-orange-500'
                        }`}></div>
                        <span className="text-sm">{availabilityStatus.message}</span>
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="border-t pt-6">
                    <h3 className="mb-4">Thông tin liên hệ</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Họ và tên</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Nguyễn Văn A"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Địa chỉ email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="nguyenvana@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+84 123 456 789"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="note">Ghi chú (tuỳ chọn)</Label>
                        <Textarea
                          id="note"
                          placeholder="Ví dụ: cần ghế trẻ em, dị ứng với hải sản..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    size="lg"
                  >
                    Xác nhận đặt bàn
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chính sách đặt bàn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-600">
                <div>
                  <h4 className="text-gray-900 mb-2">Hủy đặt bàn</h4>
                  <p>Vui lòng hủy ít nhất 24 giờ trước để tránh phí hủy.</p>
                </div>
                <div>
                  <h4 className="text-gray-900 mb-2">Đến muộn</h4>
                  <p>Bàn được giữ trong 15 phút sau giờ đặt. Vui lòng gọi nếu đến muộn.</p>
                </div>
                <div>
                  <h4 className="text-gray-900 mb-2">Nhóm lớn</h4>
                  <p>Đối với nhóm 9 người trở lên, vui lòng gọi trực tiếp (555) 123-4567.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cần hỗ trợ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">Điện thoại</div>
                  <div className="text-gray-900">(555) 123-4567</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Email</div>
                  <div className="text-gray-900">reservations@labella.com</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Giờ mở cửa</div>
                  <div className="text-gray-900">T2-T5: 11:00-22:00</div>
                  <div className="text-gray-900">T6-T7: 11:00-23:00</div>
                  <div className="text-gray-900">CN: 10:00-21:00</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
