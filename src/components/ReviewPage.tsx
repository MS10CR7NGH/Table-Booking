import { Star, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import TestimonialsSlider from './TestimonialsSlider';
import { motion } from 'motion/react';

const reviewStats = [
  { label: 'Đánh giá trung bình', value: '4.9', total: '/5' },
  { label: 'Tổng số đánh giá', value: '258', total: 'đánh giá' },
  { label: 'Khách hàng hài lòng', value: '98%', total: 'hài lòng' },
  { label: 'Năm hoạt động', value: '12', total: 'năm' }
];

const ratingDistribution = [
  { stars: 5, count: 245, percentage: 95 },
  { stars: 4, count: 10, percentage: 4 },
  { stars: 3, count: 2, percentage: 1 },
  { stars: 2, count: 1, percentage: 0 },
  { stars: 1, count: 0, percentage: 0 }
];

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent py-4">
            ⭐ Đánh giá của khách hàng
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Khám phá những trải nghiệm tuyệt vời tại DinnerThings
          </p>
        </motion.div>

        {/* Restaurant Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-2 border-black shadow-xl mb-12 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-amber-500 to-amber-600"></div>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Restaurant Details */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">🍽️ DinnerThings</h2>
                  <p className="text-gray-600 mb-6 text-lg">
                    Là một nhà hàng sang trọng với thiết kế hiện đại, DinnerThings mang đến trải nghiệm ẩm thực đẳng cấp thế giới. Chúng tôi chuyên phục vụ các món ăn fusion kết hợp giữa truyền thống và hiện đại.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-5 h-5 mr-3 text-amber-600" />
                      <span>123 Đường Nguyễn Huệ, Quận 1, TP. HCM</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Phone className="w-5 h-5 mr-3 text-amber-600" />
                      <span>(+84) 28 3821 1234</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Mail className="w-5 h-5 mr-3 text-amber-600" />
                      <span>DinnerThings@gmail.com</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-5 h-5 mr-3 text-amber-600" />
                      <span>11:00 AM - 11:00 PM (Hàng ngày)</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Badge className="bg-amber-600 text-black px-4 py-2 text-sm">
                      ⭐⭐⭐Michelin Star
                    </Badge>
                    <Badge className="bg-emerald-600 text-black px-4 py-2 text-sm">
                      🏆 Nằm trong top 10 Nhà hàng tại Đà Nẵng
                    </Badge>
                  </div>
                </motion.div>

                {/* Rating Stats */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {reviewStats.map((stat, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200"
                      >
                        <div className="text-3xl font-bold text-amber-600 mb-1">
                          {stat.value}
                          <span className="text-sm text-gray-600 ml-1">{stat.total}</span>
                        </div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Rating Distribution */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">Phân bố đánh giá</h3>
                    <div className="space-y-3">
                      {ratingDistribution.map((item, idx) => (
                        <div key={idx} className="flex items-center">
                          <div className="flex items-center w-12">
                            {[...Array(item.stars)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <div className="flex-1 mx-3">
                            <div className="bg-gray-200 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percentage}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full"
                              />
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 w-12 text-right">
                            {item.count}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Testimonials Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            💬 Những bình luận từ khách hàng
          </h2>
          <TestimonialsSlider />
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <Card className="border-2 border-amber-600 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Hãy chia sẻ trải nghiệm của bạn
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Chúng tôi rất muốn nghe những nhận xét của bạn! Nếu bạn đã dine at DinnerThings, vui lòng chia sẻ đánh giá của mình để giúp chúng tôi cải thiện dịch vụ.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-amber-600 text-black hover:bg-amber-700 hover:text-white font-bold px-8 py-3 text-lg shadow-lg">
                  ⭐ Viết đánh giá của bạn
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        <br />
        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">🎯 Sứ mệnh</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Mang đến trải nghiệm ẩm thực tuyệt vời, nơi mỗi khách hàng cảm thấy được chào đón như gia đình.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">👨‍🍳 Đầu bếp</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Dẫn dắt bởi các đầu bếp đạt Michelin sao, với hơn 20 năm kinh nghiệm trong ẩm thực cao cấp.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">🌟 Đặc biệt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Cung cấp các phòng ăn riêng để các sự kiện đặc biệt với menu tùy chỉnh theo yêu cầu.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
