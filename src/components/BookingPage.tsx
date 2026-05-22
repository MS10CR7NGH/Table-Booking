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
import { toast } from 'sonner';
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
      link.download = `DinnerThings_Booking_${bookingId || Date.now()}.png`;
    link.click();
      toast.success('Đã tải ảnh chi tiết đặt bàn!');
    } catch (error) {
      console.error('Failed to download image', error);
      toast.error('Tải ảnh thất bại');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-2xl overflow-hidden" id="booking-summary">
              <div className="h-1 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500"></div>
              <CardContent className="p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Check className="w-10 h-10 text-green-600" />
                </motion.div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Đặt bàn thành công!</h1>
                <p className="text-lg text-gray-600 mb-8 text-center">
                  Cảm ơn bạn, <span className="font-semibold text-amber-600">{name}</span>! Bàn của bạn đã được đặt.
                </p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 mb-6 border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Chi tiết đặt bàn</h3>
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-white rounded-lg">
                      <Calendar className="w-5 h-5 mr-4 text-amber-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{date && formatDate(date)}</span>
                    </div>
                    <div className="flex items-center p-3 bg-white rounded-lg">
                      <Clock className="w-5 h-5 mr-4 text-amber-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{time}</span>
                    </div>
                    <div className="flex items-center p-3 bg-white rounded-lg">
                      <Users className="w-5 h-5 mr-4 text-amber-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{guests} {parseInt(guests) === 1 ? 'Khách' : 'Khách'}</span>
                    </div>
                    <div className="flex items-center p-3 bg-white rounded-lg">
                      <MapPin className="w-5 h-5 mr-4 text-amber-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{diningPreference === 'indoor' ? 'Trong nhà' : 'Ngoài trời'}</span>
                    </div>
                    {note && (
                      <div className="flex items-start p-3 bg-white rounded-lg">
                        <StickyNote className="w-5 h-5 mr-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{note}</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg p-6 mb-8"
                >
                  <p className="text-gray-700 mb-3">
                    📧 Email xác nhận đã được gửi đến <strong className="text-amber-700">{email}</strong>
                  </p>
                  <p className="text-gray-700 mb-3">
                    📱 SMS xác nhận đã được gửi đến <strong className="text-amber-700">{phone}</strong>
                  </p>
                  {bookingId && (
                    <p className="text-sm text-amber-700 pt-3 border-t border-amber-200">
                      Mã đặt bàn: <strong className="font-mono text-lg">{bookingId}</strong>
                    </p>
                  )}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                  <Button 
                    onClick={() => setIsSubmitted(false)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8"
                  >
                    Đặt bàn khác
                  </Button>
                  <Button 
                    onClick={downloadImage}
                    variant="outline"
                    className="border-2 border-amber-600 text-amber-600 hover:bg-amber-50 font-semibold px-8"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Tải về
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Đặt bàn của bạn</h1>
          <p className="text-xl text-gray-600">
            Trải nghiệm ẩm thực tuyệt vời tại DinnerThings
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto mt-6 rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <CardTitle className="text-2xl text-gray-900">Chi tiết đặt bàn</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Hãy điền thông tin để hoàn tất việc đặt bàn</p>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Section 1: Ngày, giờ, khách */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b-2 border-amber-200">
                      1️⃣ Chọn ngày, giờ & số khách
                    </h3>

                    {/* Date Selection */}
                    <div className="mb-6">
                      <Label htmlFor="date" className="mb-2 block font-semibold text-gray-700">Chọn ngày</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            type="button"
                            className="w-full flex items-center justify-start px-4 py-3 border-2 border-gray-300 rounded-lg bg-white hover:bg-gray-50 hover:border-amber-400 transition-all focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                          >
                            <Calendar className="mr-3 h-5 w-5 text-amber-600" />
                            <span className="text-gray-700 font-medium">{date ? formatDate(date) : 'Chọn ngày'}</span>
                          </motion.button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-2 border-amber-200" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(date: Date) => {
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="time" className="mb-2 block font-semibold text-gray-700">Chọn giờ</Label>
                        <Select value={time} onValueChange={setTime}>
                          <SelectTrigger className="border-2 border-gray-300 hover:border-amber-400 h-12">
                            <Clock className="w-4 h-4 mr-2 text-amber-600" />
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
                        <Label htmlFor="guests" className="mb-2 block font-semibold text-gray-700">Số lượng khách</Label>
                        <Select value={guests} onValueChange={setGuests}>
                          <SelectTrigger className="border-2 border-gray-300 hover:border-amber-400 h-12">
                            <Users className="w-4 h-4 mr-2 text-amber-600" />
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
                  </div>

                  {/* Section 2: Dining Preference */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b-2 border-amber-200">
                      2️⃣ Sở thích chỗ ngồi
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setDiningPreference('indoor')}
                        className={`p-6 border-2 rounded-xl transition-all font-semibold ${
                          diningPreference === 'indoor'
                            ? 'border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900'
                            : 'border-gray-300 hover:border-amber-300 text-gray-700'
                        }`}
                      >
                        <Utensils className={`w-6 h-6 mx-auto mb-3 ${diningPreference === 'indoor' ? 'text-amber-600' : 'text-gray-400'}`} />
                        <div className="text-base">Trong nhà</div>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setDiningPreference('outdoor')}
                        className={`p-6 border-2 rounded-xl transition-all font-semibold ${
                          diningPreference === 'outdoor'
                            ? 'border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900'
                            : 'border-gray-300 hover:border-amber-300 text-gray-700'
                        }`}
                      >
                        <MapPin className={`w-6 h-6 mx-auto mb-3 ${diningPreference === 'outdoor' ? 'text-amber-600' : 'text-gray-400'}`} />
                        <div className="text-base">Ngoài trời</div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Availability Indicator */}
                  {availabilityStatus && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border-2 ${
                        availabilityStatus.status === 'available' ? 'bg-green-50 border-green-200' :
                        availabilityStatus.status === 'limited' ? 'bg-yellow-50 border-yellow-200' :
                        availabilityStatus.status === 'unavailable' ? 'bg-red-50 border-red-200' :
                        'bg-orange-50 border-orange-200'
                      }`}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 animate-pulse ${
                          availabilityStatus.status === 'available' ? 'bg-green-500' :
                          availabilityStatus.status === 'limited' ? 'bg-yellow-500' :
                          availabilityStatus.status === 'unavailable' ? 'bg-red-500' :
                          'bg-orange-500'
                        }`}></div>
                        <span className="text-sm font-semibold">{availabilityStatus.message}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Section 3: Contact Information */}
                  <div className="pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b-2 border-amber-200">
                      3️⃣ Thông tin liên hệ
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="font-semibold text-gray-700 mb-2 block">Họ và tên</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Nguyễn Văn A"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="border-2 border-gray-300 hover:border-amber-400 h-12 text-base"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="font-semibold text-gray-700 mb-2 block">Địa chỉ email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="nguyenvana@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-2 border-gray-300 hover:border-amber-400 h-12 text-base"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="font-semibold text-gray-700 mb-2 block">Số điện thoại</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+84 123 456 789"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="border-2 border-gray-300 hover:border-amber-400 h-12 text-base"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="note" className="font-semibold text-gray-700 mb-2 block">Ghi chú (tuỳ chọn)</Label>
                        <Textarea
                          id="note"
                          placeholder="Ví dụ: cần ghế trẻ em, dị ứng với hải sản..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={3}
                          className="border-2 border-gray-300 hover:border-amber-400 text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3 text-lg shadow-lg"
                      size="lg"
                    >
                      Xác nhận đặt bàn
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-white to-gray-50">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <CardTitle className="text-lg">✓ Chính sách đặt bàn</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h4 className="text-gray-900 font-semibold mb-2">🚫 Hủy đặt bàn</h4>
                  <p className="text-sm text-gray-600">Vui lòng hủy ít nhất 24 giờ trước để tránh phí hủy.</p>
                </div>
                <div>
                  <h4 className="text-gray-900 font-semibold mb-2">⏰ Đến muộn</h4>
                  <p className="text-sm text-gray-600">Bàn được giữ trong 15 phút sau giờ đặt. Vui lòng gọi nếu đến muộn.</p>
                </div>
                <div>
                  <h4 className="text-gray-900 font-semibold mb-2">👥 Nhóm lớn</h4>
                  <p className="text-sm text-gray-600">Đối với nhóm 9 người trở lên, vui lòng gọi trực tiếp.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-white to-gray-50">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100 border-b">
                <CardTitle className="text-lg">💬 Cần hỗ trợ?</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1 font-medium">📞 Điện thoại</div>
                  <div className="text-gray-900 font-semibold text-lg">(+84) 236 123 4567</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1 font-medium">✉️ Email</div>
                  <div className="text-gray-900 font-semibold">reservations@dinnerthings.vn</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1 font-medium">🕐 Giờ mở cửa</div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>T2-T5: 11:00-22:00</div>
                    <div>T6-T7: 11:00-23:00</div>
                    <div>CN: 10:00-21:00</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
