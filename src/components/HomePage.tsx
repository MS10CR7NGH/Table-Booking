import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Phone, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import TestimonialsSlider from './TestimonialsSlider';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1744776411221-702f2848b0b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXN0YXVyYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY0Mjg4NzkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Luxury restaurant interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white max-w-2xl"
          >
            <h1 className="text-5xl md:text-6xl mb-6">
              Trải Nghiệm Ẩm Thực Đẳng Cấp
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Khám phá hương vị tinh tế, dịch vụ hoàn hảo và không gian đáng nhớ tại Aura Dining. Đặt bàn ngay hôm nay và tận hưởng hành trình ẩm thực.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate('/booking')} size="lg" className="bg-amber-600 hover:bg-amber-700">
                Đặt bàn ngay
              </Button>
              <Button onClick={() => navigate('/menu')} size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white hover:bg-white/20">
                Xem thực đơn
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white hover:bg-white/20">
                Đặt món online
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl mb-6">Chào mừng đến Aura Dining</h2>
              <p className="text-gray-600 mb-4">
                Hơn 20 năm qua, Aura Dining đã phục vụ những món ăn tinh tế nhất tại trung tâm thành phố New York. Niềm đam mê với ẩm thực đặc biệt, cùng cam kết về dịch vụ xuất sắc, tạo nên trải nghiệm ẩm thực khó quên.
              </p>
              <p className="text-gray-600 mb-6">
                Đầu bếp của chúng tôi chỉ sử dụng nguyên liệu tươi ngon nhất, có nguồn gốc địa phương để chế biến những món ăn chân thực, kết hợp giữa truyền thống và sáng tạo. Dù bạn đến với chúng tôi cho bữa tối lãng mạn, bữa trưa công việc hay lễ kỷ niệm đặc biệt, chúng tôi hứa sẽ làm cho mọi khoảnh khắc đều đáng nhớ.
              </p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl text-amber-600 mb-1">20+</div>
                  <div className="text-sm text-gray-600">Năm kinh nghiệm</div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl text-amber-600 mb-1">15K+</div>
                  <div className="text-sm text-gray-600">Khách hàng hài lòng</div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl text-amber-600 mb-1">4.9</div>
                  <div className="text-sm text-gray-600">Đánh giá trung bình</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1761095596765-c8abe01d3aea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwZm9vZCUyMHBsYXRpbmd8ZW58MXx8fHwxNzY0Mzk3NTU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Fine dining"
                className="w-full h-64 object-cover rounded-lg"
              />
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1676300184847-4ee4030409c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGRpc2glMjBnb3VybWV0fGVufDF8fHx8MTc2NDMwMzU1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Pasta dish"
                className="w-full h-64 object-cover rounded-lg mt-8"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Khách hàng nói gì về chúng tôi</h2>
            <p className="text-gray-600">Đừng chỉ nghe chúng tôi nói - hãy lắng nghe từ những khách hàng hài lòng</p>
          </div>
          <TestimonialsSlider />
        </div>
      </section>

      {/* Location & Hours Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl mb-8">Ghé thăm chúng tôi</h2>
                
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-amber-100 rounded-lg">
                        <MapPin className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="mb-2">Địa chỉ</h3>
                        <p className="text-gray-600">
                          15 Đ. 2 Tháng 9<br />
                          Hoà Cường Nam, Hải Châu, Đà Nẵng<br />
                          Việt Nam
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-amber-100 rounded-lg">
                        <Clock className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="mb-2">Giờ mở cửa</h3>
                        <div className="space-y-1 text-gray-600">
                          <p>Thứ 2 - Thứ 5: 11:00 - 22:00</p>
                          <p>Thứ 6 - Thứ 7: 11:00 - 23:00</p>
                          <p>Chủ nhật: 10:00 - 21:00</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-amber-100 rounded-lg">
                        <Phone className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="mb-2">Liên hệ</h3>
                        <p className="text-gray-600">
                          Điện thoại: (555) 123-4567<br />
                          Email: hello@labella.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Map */}
            <div className="h-[600px] rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d239.66607138157678!2d108.224018639066!3d16.031353783386677!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c792252a13%3A0x1df0cb4b86727e06!2zxJDDoCBO4bq1bmcsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1764576972285!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Restaurant Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-amber-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl mb-6">Sẵn sàng dùng bữa với chúng tôi?</h2>
          <p className="text-xl mb-8 text-amber-100">
            Đặt bàn ngay bây giờ và trải nghiệm ẩm thực tinh tế nhất tại New York
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => navigate('/booking')} size="lg" className="bg-white text-amber-800 hover:bg-amber-50 border-2 border-white shadow-lg">
              Đặt bàn ngay
            </Button>
            <Button onClick={() => navigate('/menu')} size="lg" className="bg-amber-900 text-white hover:bg-amber-950 border-2 border-white">
              Khám phá thực đơn
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
