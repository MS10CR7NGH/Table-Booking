import { Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

const testimonials = [
  {
    id: 1,
    name: 'Nguyễn Lan Anh',
    role: 'Nhà phê bình ẩm thực',
    rating: 5,
    text: 'Trải nghiệm tuyệt vời! Không gian hoàn hảo, dịch vụ xuất sắc, và thức ăn ngon không tưởng. Món pasta đặc biệt của đầu bếp là món ngon nhất tôi từng ăn. Chắc chắn sẽ quay lại!',
    initials: 'LA'
  },
  {
    id: 2,
    name: 'Trần Minh Quân',
    role: 'Khách hàng thân thiết',
    rating: 5,
    text: 'Aura Dining đã trở thành nhà hàng yêu thích của gia đình tôi cho những dịp đặc biệt. Nhân viên nhớ tên chúng tôi và luôn phục vụ tận tâm. Rượu vang tuyệt vời và món tráng miệng thần thánh.',
    initials: 'MQ'
  },
  {
    id: 3,
    name: 'Phạm Thu Hà',
    role: 'Giám đốc điều hành',
    rating: 5,
    text: 'Tôi đã tổ chức nhiều bữa tối công việc ở đây, và chưa lần nào thất vọng. Khu vực ăn riêng hoàn hảo cho các cuộc họp, thực đơn phong phú đáp ứng mọi khẩu vị. Rất đáng để giới thiệu!',
    initials: 'TH'
  },
  {
    id: 4,
    name: 'Võ Quốc Bảo',
    role: 'Kỷ niệm ngày cưới',
    rating: 5,
    text: 'Chúng tôi kỷ niệm 25 năm ngày cưới tại Aura Dining và đó là một trải nghiệm kỳ diệu. Nhân viên chu đáo, bít tết nấu hoàn hảo và không gian lãng mạn khiến buổi tối trở nên đáng nhớ.',
    initials: 'QB'
  },
  {
    id: 5,
    name: 'Lê Kim Oanh',
    role: 'Blogger ẩm thực',
    rating: 5,
    text: 'Là người đánh giá nhà hàng chuyên nghiệp, tôi ấn tượng bởi cách Aura Dining cân bằng giữa trình bày nghệ thuật, hương vị phức tạp và dịch vụ tinh tế. Một viên ngọc thật sự!',
    initials: 'KO'
  }
];

export default function TestimonialsSlider() {
  return (
    <div className="relative px-12">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarFallback className="bg-amber-100 text-amber-600">
                          {testimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                      </div>
                    </div>

                    <div className="flex mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <p className="text-gray-600">{testimonial.text}</p>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
}
