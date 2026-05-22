import { Card, CardContent } from './ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useNavigate } from 'react-router-dom';

const dishes = [
  {
    id: 1,
    name: 'Saumon en Papillote',
    description: 'Cá hồi tươi được nấu trong giấy bạc với rau thơm, bơ Normandie và sốt trắng tinh tế',
    price: '480.000₫',
    image: 'https://tse4.mm.bing.net/th/id/OIP.pGauVzYJKQE9oFSx7FEX7gHaEO?rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    id: 2,
    name: 'Coq au Vin',
    description: 'Gà tây nấu chậm với rượu vang đỏ Burgundy, nấm, hành tây và lard, phục vụ kèm khoai tây nấu từng',
    price: '520.000₫',
    image: 'https://poshjournal.com/wp-content/uploads/2020/10/coq-au-vin-recipe.jpg',
  },
  {
    id: 3,
    name: 'Canard aux Cerises',
    description: 'Vịt nướng hoàn hảo phủ sốt anh đào cổ điển, cân bằng giữa vị ngọt và vị mặn tinh tế',
    price: '580.000₫',
    image: 'https://tse2.mm.bing.net/th/id/OIP.Idnxzyh75GnPeFpDhInRxgHaFj?rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    id: 4,
    name: 'Homard à l\'Américaine',
    description: 'Tôm hùm tươi nấu với rượu cognac, cà chua, hành tây và thảo mộc Provence, phục vụ kèm mì ý',
    price: '720.000₫',
    image: 'https://tse2.mm.bing.net/th/id/OIP.WdhqycVS_L2G0X3R2PEWrgHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    id: 5,
    name: 'Tournedos Rossini',
    description: 'Thăn bò Charolais cao cấp nấu tái, đặt trên bánh mì dán với pâté gan ngỗng, phủ sốt truffles đen',
    price: '850.000₫',
    image: 'https://th.bing.com/th/id/OIP.r-J5AgCZ_RD5wBg4RICNaQHaE8?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3',
  },
];

export default function DishSlider() {
  const navigate = useNavigate();

  return (
    <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 px-12 rounded-lg py-20">
      <div className="mb-8">
        <h2 className="text-3xl text-center font-bold text-gray-900">Những Món Ăn Pháp Kinh Điển</h2>
        <p className="text-gray-600 text-center mt-2">Khám phá các biệt tài ẩm thực từ xứ Pháp được đầu bếp chế biến tại DinnerThings</p>
      </div>
      
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 6000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {dishes.map((dish) => (
            <CarouselItem key={dish.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="w-full h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{dish.name}</h3>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{dish.description}</p>

                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-amber-600">{dish.price}</span>
                      <button onClick={() => navigate('../booking')} className="px-4 py-2 bg-amber-600 text-black hover:bg-amber-700  hover:text-white rounded-md transition-colors text-sm font-medium">
                        Đặt ngay
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex absolute -left-12 top-1/2" />
        <CarouselNext className="hidden md:flex absolute -right-12 top-1/2" />
      </Carousel>
    </div>
  );
}
