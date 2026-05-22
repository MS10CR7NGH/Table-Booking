import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Check, Utensils, Download, Armchair, StickyNote } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { buildApiUrl } from '../utils/api/config';

interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  location: 'indoor' | 'outdoor';
  isAvailable: boolean;
  description?: string;
  isBooked?: boolean;
}

export default function BookingPageWithTableSelection() {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('');
  const [diningPreference, setDiningPreference] = useState('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  // Generate available time slots
  const timeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
    '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
    '9:00 PM', '9:30 PM', '10:00 PM'
  ];

  // Fetch available tables when date, time, guests, and preference are selected
  useEffect(() => {
    if (date && time && guests && diningPreference && step === 2) {
      fetchAvailableTables();
    }
  }, [date, time, guests, diningPreference, step]);

  const fetchAvailableTables = async () => {
    if (!date || !time || !guests || !diningPreference) return;
    
    setIsLoadingTables(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(
        buildApiUrl(`/tables/available?date=${dateStr}&time=${encodeURIComponent(time)}&guests=${guests}&preference=${diningPreference}`)
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableTables(data.tables || []);
      } else {
        toast.error('Failed to load available tables');
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to load tables');
    } finally {
      setIsLoadingTables(false);
    }
  };

  const handleContinueToTableSelection = () => {
    if (!date || !time || !guests || !diningPreference) {
      toast.error('Please fill in all fields');
      return;
    }
    setStep(2);
  };

  const handleContinueToContactInfo = () => {
    if (!selectedTable) {
      toast.error('Vui lòng chọn bàn');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !guests || !diningPreference || !selectedTable || !name || !email || !phone) {
      toast.error('Vui lòng điền đầy đủ thông tin');
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
            guests: parseInt(guests),
            diningPreference,
            tableId: selectedTable.id,
            tableNumber: selectedTable.tableNumber,
            note: note.trim()
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookingId(data.bookingId);
        setIsSubmitted(true);
        toast.success('Đặt bàn thành công! Vui lòng kiểm tra email để xem chi tiết.');
        
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
    const summary = document.getElementById('booking-with-table-summary');
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center border-0 shadow-xl overflow-hidden" id="booking-with-table-summary">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardContent className="p-12 bg-green-50">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Check className="w-10 h-10 text-green-600" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold mb-2 bg-amber-600 bg-clip-text text-transparent"
                >
                  Đặt bàn thành công!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 mb-6 text-lg"
                >
                  Cảm ơn bạn, <strong>{name}!</strong> Bàn của bạn đã được đặt.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 mb-6 text-left border border-gray-200"
                >
                  <h3 className="mb-4 font-bold text-gray-900">📋 Chi tiết đặt bàn</h3>
                  <div className="space-y-3 text-gray-700">
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
                      <Armchair className="w-5 h-5 mr-3 text-amber-600" />
                      <span>Bàn {selectedTable?.tableNumber}</span>
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg p-4 mb-6"
                >
                  <p className="text-sm text-amber-900 mb-2 font-medium">
                    ✉️ Email xác nhận đã được gửi đến <strong>{email}</strong> và SMS đến <strong>{phone}</strong>
                  </p>
                  {bookingId && (
                    <p className="text-xs text-amber-800">
                      🎫 Mã đặt bàn: <strong>{bookingId}</strong>
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-3 justify-center"
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => {
                        setIsSubmitted(false);
                        setStep(1);
                        setSelectedTable(null);
                      }}
                      className="bg-amber-600 text-black hover:bg-amber-700  hover:text-white font-bold shadow-lg"
                    >
                      Đặt bàn khác
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={downloadImage}
                      variant="outline"
                      className="border-2"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Tải về
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((s, idx) => (
              <div key={s} className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    step >= s ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-black shadow-lg' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </motion.div>
                {idx < 2 && (
                  <div className={`w-20 h-1 mx-2 ${
                    step > s ? 'bg-amber-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 text-sm text-gray-600">
            <span className="w-32 text-center">Ngày & Giờ</span>
            <span className="w-32 text-center">Chọn bàn</span>
            <span className="w-32 text-center">Thông tin liên hệ</span>
          </div>
        </motion.div>

        <Card className="border-2 border-black shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardTitle className="text-2xl text-gray-900">
                {step === 1 && '1️⃣ Chi tiết đặt bàn'}
                {step === 2 && '2️⃣ Chọn bàn của bạn'}
                {step === 3 && '3️⃣ Thông tin liên hệ'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {step === 1 && 'Vui lòng chọn ngày, giờ và sở thích chỗ ngồi'}
                {step === 2 && 'Chọn bàn phù hợp với nhu cầu của bạn'}
                {step === 3 && 'Điền đầy đủ thông tin liên hệ của bạn'}
              </p>
            </motion.div>
          </CardHeader>
          <CardContent className="p-8">
            {/* Step 1: Date, Time, Guests, Preference */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <Label className="text-gray-900 font-semibold mb-3 block">📅 Chọn ngày dùng bữa</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline" className="w-full justify-start text-left font-normal border-2 border-gray-300 hover:border-amber-400 h-12 text-base">
                          <Calendar className="mr-2 h-4 w-4" />
                          {date ? formatDate(date) : <span className="text-gray-500">Chọn ngày...</span>}
                        </Button>
                      </motion.div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={(newDate: Date | undefined) => setDate(newDate)}
                        initialFocus
                        disabled={(date: Date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-900 font-semibold mb-3 block">🕐 Chọn giờ</Label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger className="border-2 border-gray-300 hover:border-amber-400 h-12 text-base">
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
                    <Label className="text-gray-900 font-semibold mb-3 block">👥 Số lượng khách</Label>
                    <Select value={guests} onValueChange={setGuests}>
                      <SelectTrigger className="border-2 border-gray-300 hover:border-amber-400 h-12 text-base">
                        <SelectValue placeholder="Chọn số khách" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Khách' : 'Khách'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-900 font-semibold mb-4 block">🏠 Sở thích chỗ ngồi</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setDiningPreference('indoor')}
                      className={`p-6 border-2 rounded-lg transition-all ${
                        diningPreference === 'indoor'
                          ? 'border-amber-600 bg-gradient-to-br from-amber-50 to-amber-100'
                          : 'border-gray-300 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <Utensils className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                      <div className="text-center font-semibold">Trong nhà</div>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setDiningPreference('outdoor')}
                      className={`p-6 border-2 rounded-lg transition-all ${
                        diningPreference === 'outdoor'
                          ? 'border-amber-600 bg-gradient-to-br from-amber-50 to-amber-100'
                          : 'border-gray-300 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <MapPin className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                      <div className="text-center font-semibold">Ngoài trời</div>
                    </motion.button>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleContinueToTableSelection}
                    className="w-full bg-amber-600 text-black hover:bg-amber-700  hover:text-white font-bold py-3 text-base shadow-lg"
                    size="lg"
                  >
                    Tiếp tục chọn bàn
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* Step 2: Table Selection */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-lg p-4"
                >
                  <p className="text-sm text-blue-900 font-medium">
                    📌 Hiển thị bàn cho <strong>{guests} khách</strong> vào {date && formatDate(date)} lúc <strong>{time}</strong> ({diningPreference === 'indoor' ? 'Trong nhà' : 'Ngoài trời'})
                  </p>
                </motion.div>

                {isLoadingTables ? (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-center py-12 text-gray-500"
                  >
                    <div className="text-4xl mb-2">⏳</div>
                    <p>Đang tải bàn có sẵn...</p>
                  </motion.div>
                ) : availableTables.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="text-5xl mb-3">😕</div>
                    <p className="text-gray-600 mb-6 text-lg">Không có bàn trống cho lựa chọn của bạn.</p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button onClick={() => setStep(1)} variant="outline" className="border-2">
                        Đổi ngày/giờ
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                  >
                    {availableTables.map((table, idx) => (
                      <motion.button
                        key={table.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTable(table)}
                        className={`p-6 border-2 rounded-lg transition-all text-center ${
                          selectedTable?.id === table.id
                            ? 'border-amber-600 bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg'
                            : 'border-gray-300 hover:border-amber-400 bg-white'
                        }`}
                      >
                        <Armchair className={`w-8 h-8 mx-auto mb-2 ${
                          selectedTable?.id === table.id ? 'text-amber-600' : 'text-gray-600'
                        }`} />
                        <div className="mb-1 font-bold">Bàn {table.tableNumber}</div>
                        <div className="text-sm text-gray-600">
                          {table.capacity} chỗ
                        </div>
                        {table.description && (
                          <div className="text-xs text-gray-500 mt-1">{table.description}</div>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3 pt-4"
                >
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="w-full border-2"
                    >
                      Quay lại
                    </Button>
                  </motion.div>
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={handleContinueToContactInfo}
                      className="w-full bg-amber-600 text-black hover:bg-amber-700  hover:text-white font-bold"
                      disabled={!selectedTable}
                    >
                      Tiếp tục
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* Step 3: Contact Information */}
            {step === 3 && (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                <div>
                  <Label htmlFor="name" className="text-gray-900 font-semibold mb-3 block">👤 Họ và tên</Label>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="border-2 border-gray-300 hover:border-amber-400 h-12 text-base"
                      required
                    />
                  </motion.div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-900 font-semibold mb-3 block">📧 Địa chỉ email</Label>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nguyenvana@example.com"
                      className="border-2 border-gray-300 hover:border-amber-400 h-12 text-base"
                      required
                    />
                  </motion.div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-900 font-semibold mb-3 block">📱 Số điện thoại</Label>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+84 123 456 789"
                      className="border-2 border-gray-300 hover:border-amber-400 h-12 text-base"
                      required
                    />
                  </motion.div>
                </div>

                <div>
                  <Label htmlFor="note" className="text-gray-900 font-semibold mb-3 block">📝 Ghi chú (tuỳ chọn)</Label>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <Textarea
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ví dụ: dị ứng hải sản, cần không gian riêng..."
                      rows={3}
                      className="border-2 border-gray-300 hover:border-amber-400 text-base"
                    />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200"
                >
                  <h4 className="text-base font-bold mb-4 text-gray-900">📋 Tóm tắt đặt bàn</h4>
                  <div className="space-y-3 text-sm text-gray-700 font-medium">
                    <div>📅 Ngày: <strong>{date && formatDate(date)}</strong></div>
                    <div>🕐 Giờ: <strong>{time}</strong></div>
                    <div>👥 Khách: <strong>{guests}</strong></div>
                    <div>🪑 Bàn: <strong>Bàn {selectedTable?.tableNumber}</strong></div>
                    <div>🏠 Vị trí: <strong>{diningPreference === 'indoor' ? 'Trong nhà' : 'Ngoài trời'}</strong></div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex gap-3 pt-4"
                >
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      type="button"
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="w-full border-2"
                    >
                      Quay lại
                    </Button>
                  </motion.div>
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      type="submit"
                      className="w-full bg-amber-600 text-black hover:bg-amber-700  hover:text-white font-bold py-3 text-base shadow-lg"
                      size="lg"
                    >
                      Xác nhận đặt bàn
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}