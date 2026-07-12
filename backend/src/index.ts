import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},
  
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      // ============================================================
      // PHASE 0: Auto-create Admin Account (persistent login)
      // ============================================================
      const adminCount = await strapi.db.query('admin::user').count({});
      if (adminCount === 0) {
        const superAdminRole = await strapi.db.query('admin::role').findOne({
          where: { code: 'strapi-super-admin' },
        });
        if (superAdminRole) {
          const hashedPassword = await strapi.service('admin::auth').hashPassword('BaoTao2026!');
          await strapi.db.query('admin::user').create({
            data: {
              firstname: 'Bảo',
              lastname: 'Táo',
              email: 'admin@baotao.vn',
              password: hashedPassword,
              isActive: true,
              blocked: false,
              roles: [superAdminRole.id],
            },
          });
          console.log('🔑 Admin account created: admin@baotao.vn / BaoTao2026!');
        }
      } else {
        console.log('🔑 Admin account already exists.');
      }

      // ============================================================
      // PHASE 1: Ensure Public API Permissions
      // ============================================================
      const publicRole = await strapi.documents('plugin::users-permissions.role').findFirst({
        filters: { type: 'public' },
      });
      
      if (publicRole) {
        const permissionsToGrant = [
          // Cars
          'api::car.car.find',
          'api::car.car.findOne',
          // Versions
          'api::version.version.find',
          'api::version.version.findOne',
          // Version Colors
          'api::version-color.version-color.find',
          'api::version-color.version-color.findOne',
          // Car Gallery
          'api::car-gallery.car-gallery.find',
          'api::car-gallery.car-gallery.findOne',
          // Leads (create only)
          'api::lead.lead.create',
          // Articles
          'api::article.article.find',
          'api::article.article.findOne',
        ];

        for (const action of permissionsToGrant) {
          try {
            await strapi.documents('plugin::users-permissions.permission').create({
              data: { action, role: publicRole.documentId }
            });
          } catch (e) {
            // Permission may already exist, skip
          }
        }
        console.log('✅ Public API permissions configured.');
      }

      // ============================================================
      // PHASE 2: Data Seeding (run once, then disable)
      // ============================================================
      const FORCE_SEED = true; // Seed image_urls

      if (!FORCE_SEED) {
        console.log('⏭️ Seeding skipped (FORCE_SEED = false)');
        return;
      }

      // Check if data already exists
      const existingCars = await strapi.documents('api::car.car').findMany({});
      if (existingCars.length > 0 && !FORCE_SEED) {
        console.log('⏭️ Data already exists, skipping seed.');
        return;
      }

      // Clear existing data for clean seed
      console.log('🗑️ Clearing existing data...');
      await strapi.db.query('api::version-color.version-color').deleteMany({});
      await strapi.db.query('api::car-gallery.car-gallery').deleteMany({});
      await strapi.db.query('api::version.version').deleteMany({});
      await strapi.db.query('api::car.car').deleteMany({});
      console.log('✅ Old data cleared.');

      // ============================================================
      // MASTER DATA: 6 Dòng Xe Chính Thức DanaFord
      // ============================================================
      const carsData = [
        {
          name: 'TERRITORY THẾ HỆ MỚI',
          image_url: null,
          slug: 'territory',
          category: 'suv' as const,
          description: 'SUV đô thị cao cấp với thiết kế hiện đại, trang bị công nghệ thông minh và tiện nghi vượt trội trong phân khúc.',
          display_order: 1,
          is_visible: true,
          price_from: '799000000',
          versions: [
            {
              name: 'Ford Territory Thế Hệ Mới — Trend 1.5L AT',
              image_url: '/uploads/cars/territory/versions/ford_territory_moi_2025_trend_3.png',
              base_price: '799000000',
              short_desc: 'Phiên bản tiêu chuẩn với đầy đủ trang bị an toàn và tiện nghi cơ bản.',
              display_order: 1,
              is_visible: true,
              engine_type: 'Xăng 1.5L EcoBoost Turbo',
              max_power: '160 HP @ 5500 rpm',
              max_torque: '248 Nm @ 1500-4000 rpm',
              transmission: 'Tự động CVT',
              drivetrain: 'FWD (Cầu trước)',
              dimensions: '4630 x 1935 x 1706',
              wheelbase: 2726,
              fuel_tank_capacity: 56,
              seating_capacity: 5,
              ground_clearance: 180,
              front_lights: 'LED Projector',
              daytime_lights: 'LED',
              airbags_count: 6,
              braking_system: 'Đĩa thông gió (trước) / Đĩa (sau)',
              esp_tc: 'ESP + Kiểm soát lực kéo',
              parking_camera: 'Camera lùi',
            },
            {
              name: 'Ford Territory Thế Hệ Mới — Titanium 1.5L AT',
              image_url: '/uploads/cars/territory/versions/ford_territory_moi_2025_titanium.png',
              base_price: '879000000',
              short_desc: 'Phiên bản nâng cao với cửa sổ trời, màn hình lớn và nhiều tính năng ADAS.',
              display_order: 2,
              is_visible: true,
              engine_type: 'Xăng 1.5L EcoBoost Turbo',
              max_power: '160 HP @ 5500 rpm',
              max_torque: '248 Nm @ 1500-4000 rpm',
              transmission: 'Tự động CVT',
              drivetrain: 'FWD (Cầu trước)',
              dimensions: '4630 x 1935 x 1706',
              wheelbase: 2726,
              fuel_tank_capacity: 56,
              seating_capacity: 5,
              ground_clearance: 180,
              front_lights: 'LED Projector tự động',
              daytime_lights: 'LED',
              airbags_count: 6,
              braking_system: 'Đĩa thông gió (trước) / Đĩa (sau)',
              esp_tc: 'ESP + Kiểm soát lực kéo',
              sunroof: 'Cửa sổ trời chỉnh điện',
              parking_camera: 'Camera 360 độ',
              adas_features: 'Cảnh báo va chạm, Phanh khẩn cấp tự động, Hỗ trợ giữ làn đường',
            },
            {
              name: 'Ford Territory Thế Hệ Mới — Titanium X 1.5L AT',
              image_url: '/uploads/cars/territory/versions/ford_territory_moi_2025_titanium_x.png',
              base_price: '929000000',
              short_desc: 'Phiên bản cao cấp nhất với nội thất da, ADAS đầy đủ và tiện nghi hàng đầu.',
              display_order: 3,
              is_visible: true,
              engine_type: 'Xăng 1.5L EcoBoost Turbo',
              max_power: '160 HP @ 5500 rpm',
              max_torque: '248 Nm @ 1500-4000 rpm',
              transmission: 'Tự động CVT',
              drivetrain: 'FWD (Cầu trước)',
              dimensions: '4630 x 1935 x 1706',
              wheelbase: 2726,
              fuel_tank_capacity: 56,
              seating_capacity: 5,
              ground_clearance: 180,
              front_lights: 'LED Projector tự động thích ứng',
              daytime_lights: 'LED',
              airbags_count: 7,
              braking_system: 'Đĩa thông gió (trước) / Đĩa (sau)',
              esp_tc: 'ESP + Kiểm soát lực kéo',
              seat_material: 'Da cao cấp',
              sunroof: 'Cửa sổ trời toàn cảnh Panoramic',
              parking_camera: 'Camera 360 độ',
              adas_features: 'Cảnh báo va chạm, Phanh khẩn cấp tự động, Hỗ trợ giữ làn đường, Kiểm soát hành trình thích ứng, Hỗ trợ đỗ xe tự động',
            },
          ],
          colors: [
            { color_name: 'Trắng Tuyết', hex_code: '#F5F5F0', is_default: true, image_url: '/uploads/cars/territory/colors/territory_mau_color_ffffff.png' },
            { color_name: 'Xám Bạc', hex_code: '#8B8D8E', is_default: false, image_url: '/uploads/cars/territory/colors/territory_mau_color_bdbdbd.png' },
            { color_name: 'Đỏ Ruby', hex_code: '#9B1B30', is_default: false, image_url: '/uploads/cars/territory/colors/territory_mau_color_d73333.png' },
            { color_name: 'Đen Absolute', hex_code: '#1A1A1A', is_default: false, image_url: '/uploads/cars/territory/colors/territory_mau_color_000000.png' },
            { color_name: 'Xanh Thiên Thanh', hex_code: '#4B9CD3', is_default: false, image_url: '/uploads/cars/territory/colors/territory_mau_color_4687b9.png' },
          ],
        },
        {
          name: 'EVEREST THẾ HỆ MỚI',
          image_url: null,
          slug: 'everest',
          category: 'suv' as const,
          description: 'SUV 7 chỗ cao cấp với khung gầm body-on-frame, khả năng vận hành mạnh mẽ cả on-road và off-road.',
          display_order: 2,
          is_visible: true,
          price_from: '1099000000',
          versions: [
            {
              name: 'Ford Everest Thế Hệ Mới — Active 2.0L AT 4x2',
              image_url: '/uploads/cars/everest/versions/ford_everest_active_moi.png',
              base_price: '1099000000',
              short_desc: 'Phiên bản khởi điểm với đầy đủ trang bị cốt lõi cho gia đình.',
              display_order: 1,
              is_visible: true,
              engine_type: 'Dầu 2.0L Turbo đơn',
              max_power: '170 HP @ 3500 rpm',
              max_torque: '405 Nm @ 1750-2500 rpm',
              transmission: 'Tự động 6 cấp',
              drivetrain: '4x2 (Cầu sau)',
              dimensions: '4914 x 1923 x 1842',
              wheelbase: 2900,
              fuel_tank_capacity: 80,
              seating_capacity: 7,
              ground_clearance: 200,
              front_lights: 'LED Projector',
              daytime_lights: 'LED',
              airbags_count: 6,
              braking_system: 'Đĩa thông gió',
              esp_tc: 'ESP + Kiểm soát lực kéo',
              parking_camera: 'Camera lùi',
            },
            {
              name: 'Ford Everest Thế Hệ Mới — Sport 2.0L AT 4x2',
              image_url: '/uploads/cars/everest/versions/ford_everest_sport_moi.png',
              base_price: '1199000000',
              short_desc: 'Phiên bản thể thao với ngoại thất mạnh mẽ và trang bị nâng cấp.',
              display_order: 2,
              is_visible: true,
              engine_type: 'Dầu 2.0L Bi-Turbo',
              max_power: '210 HP @ 3750 rpm',
              max_torque: '500 Nm @ 1750-2000 rpm',
              transmission: 'Tự động 10 cấp',
              drivetrain: '4x2 (Cầu sau)',
              dimensions: '4914 x 1923 x 1842',
              wheelbase: 2900,
              fuel_tank_capacity: 80,
              seating_capacity: 7,
              ground_clearance: 200,
              front_lights: 'LED Projector tự động',
              daytime_lights: 'LED',
              airbags_count: 7,
              braking_system: 'Đĩa thông gió',
              esp_tc: 'ESP + Kiểm soát lực kéo',
              parking_camera: 'Camera 360 độ',
            },
            {
              name: 'Ford Everest Thế Hệ Mới — Platinum 2.0L AT 4x2',
              image_url: '/uploads/cars/everest/versions/ford_everest_moi_titanium_2_0l_at_4x2.png',
              base_price: '1399000000',
              short_desc: 'Phiên bản sang trọng với nội thất cao cấp, ADAS đầy đủ.',
              display_order: 3,
              is_visible: true,
              engine_type: 'Dầu 2.0L Bi-Turbo',
              max_power: '210 HP @ 3750 rpm',
              max_torque: '500 Nm @ 1750-2000 rpm',
              transmission: 'Tự động 10 cấp',
              drivetrain: '4x2 (Cầu sau)',
              dimensions: '4914 x 1923 x 1842',
              wheelbase: 2900,
              fuel_tank_capacity: 80,
              seating_capacity: 7,
              ground_clearance: 200,
              front_lights: 'LED Matrix tự động thích ứng',
              daytime_lights: 'LED',
              airbags_count: 8,
              braking_system: 'Đĩa thông gió',
              esp_tc: 'ESP + Kiểm soát lực kéo',
              seat_material: 'Da cao cấp',
              sunroof: 'Cửa sổ trời toàn cảnh Panoramic',
              parking_camera: 'Camera 360 độ',
              adas_features: 'Cảnh báo va chạm, Phanh khẩn cấp, Giữ làn, Kiểm soát hành trình thích ứng, Hỗ trợ đỗ xe',
            },
            {
              name: 'Ford Everest Thế Hệ Mới — Platinum 2.0L AT 4x4',
              image_url: '/uploads/cars/everest/colors/ford_everest_moi_platinum_2_0l_10at_4x4.jpg',
              base_price: '1499000000',
              short_desc: 'Phiên bản Platinum dẫn động 4 bánh, chinh phục mọi địa hình.',
              display_order: 4,
              is_visible: true,
              engine_type: 'Dầu 2.0L Bi-Turbo',
              max_power: '210 HP @ 3750 rpm',
              max_torque: '500 Nm @ 1750-2000 rpm',
              transmission: 'Tự động 10 cấp',
              drivetrain: '4WD (Dẫn động 4 bánh)',
              dimensions: '4914 x 1923 x 1842',
              wheelbase: 2900,
              fuel_tank_capacity: 80,
              seating_capacity: 7,
              ground_clearance: 200,
              front_lights: 'LED Matrix tự động thích ứng',
              daytime_lights: 'LED',
              airbags_count: 8,
              braking_system: 'Đĩa thông gió',
              esp_tc: 'ESP + Kiểm soát lực kéo',
              seat_material: 'Da cao cấp',
              sunroof: 'Cửa sổ trời toàn cảnh Panoramic',
              parking_camera: 'Camera 360 độ',
              adas_features: 'Cảnh báo va chạm, Phanh khẩn cấp, Giữ làn, Kiểm soát hành trình thích ứng, Hỗ trợ đỗ xe tự động',
            },
            {
              name: 'Ford Everest Thế Hệ Mới — Platinum+ 2.3L AT 4x4',
              image_url: '/uploads/cars/everest/versions/ford_everest_moi_platinum_2_3l.png',
              base_price: '1629000000',
              short_desc: 'Phiên bản đỉnh cao nhất với động cơ xăng 2.3L EcoBoost cực mạnh.',
              display_order: 5,
              is_visible: true,
              engine_type: 'Xăng 2.3L EcoBoost Turbo',
              max_power: '299 HP @ 5500 rpm',
              max_torque: '420 Nm @ 3000 rpm',
              transmission: 'Tự động 10 cấp',
              drivetrain: '4WD (Dẫn động 4 bánh)',
              dimensions: '4914 x 1923 x 1842',
              wheelbase: 2900,
              fuel_tank_capacity: 80,
              seating_capacity: 7,
              ground_clearance: 200,
              front_lights: 'LED Matrix tự động thích ứng',
              daytime_lights: 'LED',
              airbags_count: 9,
              braking_system: 'Đĩa thông gió',
              esp_tc: 'ESP + Kiểm soát lực kéo + HSA',
              seat_material: 'Da Nappa cao cấp',
              sunroof: 'Cửa sổ trời toàn cảnh Panoramic',
              parking_camera: 'Camera 360 độ',
              adas_features: 'ADAS cấp 2 đầy đủ: Cảnh báo va chạm, Phanh khẩn cấp, Giữ làn, Kiểm soát hành trình thích ứng, Hỗ trợ đỗ xe tự động, Đèn pha tự động thích ứng',
            },
          ],
          colors: [
            { color_name: 'Màu color_545454', hex_code: '#545454', is_default: true, image_url: '/uploads/cars/everest/colors/everest_mau_color_545454.webp' },
            { color_name: 'Màu color_ffffff', hex_code: '#ffffff', is_default: false, image_url: '/uploads/cars/everest/colors/everest_mau_color_ffffff.webp' },
            { color_name: 'Màu color_000000', hex_code: '#000000', is_default: false, image_url: '/uploads/cars/everest/colors/everest_mau_color_000000.webp' },
            { color_name: 'Màu color_364927', hex_code: '#364927', is_default: false, image_url: '/uploads/cars/everest/colors/everest_mau_color_364927.webp' },
            { color_name: 'Màu color_858585', hex_code: '#858585', is_default: false, image_url: '/uploads/cars/everest/colors/everest_mau_color_858585.webp' },
          ],
        },
        {
          name: 'RANGER THẾ HỆ MỚI',
          image_url: null,
          slug: 'ranger',
          category: 'pickup' as const,
          description: 'Bán tải hàng đầu Việt Nam với thiết kế cứng cáp, công nghệ hiện đại và khả năng vận hành vượt trội.',
          display_order: 3,
          is_visible: true,
          price_from: '659000000',
          versions: [
            {
              name: 'Ford Ranger Thế Hệ Mới — XLS 4x2 AT',
              image_url: '/uploads/cars/ranger/versions/ford_ranger_xls_4x2.png',
              base_price: '659000000',
              short_desc: 'Phiên bản tiêu chuẩn dành cho công việc và gia đình.',
              display_order: 1,
              is_visible: true,
              engine_type: 'Dầu 2.0L Turbo đơn',
              max_power: '170 HP @ 3500 rpm',
              max_torque: '405 Nm @ 1750-2500 rpm',
              transmission: 'Tự động 6 cấp',
              drivetrain: '4x2 (Cầu sau)',
              dimensions: '5370 x 1918 x 1884',
              wheelbase: 3270,
              fuel_tank_capacity: 80,
              seating_capacity: 5,
              ground_clearance: 235,
              front_lights: 'LED Reflector',
              daytime_lights: 'LED',
              airbags_count: 6,
              braking_system: 'Đĩa thông gió (trước) / Tang trống (sau)',
              esp_tc: 'ESP + Kiểm soát lực kéo',
              parking_camera: 'Camera lùi',
            },
            {
              name: 'Ford Ranger Thế Hệ Mới — XLS 4x4 AT',
              image_url: '/uploads/cars/ranger/versions/ford_ranger_xls_4x4.png',
              base_price: '759000000',
              short_desc: 'Phiên bản XLS dẫn động 4 bánh cho địa hình đa dạng.',
              display_order: 2,
              is_visible: true,
              engine_type: 'Dầu 2.0L Turbo đơn',
              max_power: '170 HP @ 3500 rpm',
              max_torque: '405 Nm @ 1750-2500 rpm',
              transmission: 'Tự động 6 cấp',
              drivetrain: '4WD (Dẫn động 4 bánh)',
              dimensions: '5370 x 1918 x 1884',
              wheelbase: 3270,
              fuel_tank_capacity: 80,
              seating_capacity: 5,
              ground_clearance: 235,
              front_lights: 'LED Reflector',
              daytime_lights: 'LED',
              airbags_count: 6,
              braking_system: 'Đĩa thông gió (trước) / Tang trống (sau)',
              esp_tc: 'ESP + Kiểm soát lực kéo',
              parking_camera: 'Camera lùi',
            },
            {
              name: 'Ford Ranger Thế Hệ Mới — Sport 4x4 AT',
              image_url: '/uploads/cars/ranger/versions/ford_ranger_xls_4x4_at.png',
              base_price: '859000000',
              short_desc: 'Phiên bản thể thao với Bi-Turbo mạnh mẽ và ngoại thất nổi bật.',
              display_order: 3,
              is_visible: true,
              engine_type: 'Dầu 2.0L Bi-Turbo',
              max_power: '210 HP @ 3750 rpm',
              max_torque: '500 Nm @ 1750-2000 rpm',
              transmission: 'Tự động 10 cấp',
              drivetrain: '4WD (Dẫn động 4 bánh)',
              dimensions: '5370 x 1918 x 1884',
              wheelbase: 3270,
              fuel_tank_capacity: 80,
              seating_capacity: 5,
              ground_clearance: 235,
              front_lights: 'LED Projector',
              daytime_lights: 'LED',
              airbags_count: 6,
              braking_system: 'Đĩa thông gió',
              esp_tc: 'ESP + Kiểm soát lực kéo',
              parking_camera: 'Camera lùi',
            },
            {
              name: 'Ford Ranger Thế Hệ Mới — Wildtrak AT 4x4',
              image_url: '/uploads/cars/ranger/versions/ford_ranger_moi_2026_wildtrak_3_0.png',
              base_price: '979000000',
              short_desc: 'Phiên bản cao cấp với ADAS, camera 360 và nội thất sang trọng.',
              display_order: 4,
              is_visible: true,
              engine_type: 'Dầu 2.0L Bi-Turbo',
              max_power: '210 HP @ 3750 rpm',
              max_torque: '500 Nm @ 1750-2000 rpm',
              transmission: 'Tự động 10 cấp',
              drivetrain: '4WD (Dẫn động 4 bánh)',
              dimensions: '5370 x 1918 x 1884',
              wheelbase: 3270,
              fuel_tank_capacity: 80,
              seating_capacity: 5,
              ground_clearance: 235,
              front_lights: 'LED Matrix',
              daytime_lights: 'LED dạng chữ C',
              airbags_count: 7,
              braking_system: 'Đĩa thông gió',
              esp_tc: 'ESP + Kiểm soát lực kéo',
              seat_material: 'Da cao cấp',
              parking_camera: 'Camera 360 độ',
              adas_features: 'Cảnh báo va chạm, Phanh khẩn cấp, Giữ làn, Kiểm soát hành trình thích ứng',
            },
            {
              name: 'Ford Ranger Thế Hệ Mới — Stormtrak AT 4x4',
              image_url: '/uploads/cars/ranger/versions/ford_ranger_stormtrak_4x4_at.png',
              base_price: '1039000000',
              short_desc: 'Phiên bản đặc biệt với nắp thùng điện và phong cách thể thao.',
              display_order: 5,
              is_visible: true,
              engine_type: 'Dầu 2.0L Bi-Turbo',
              max_power: '210 HP @ 3750 rpm',
              max_torque: '500 Nm @ 1750-2000 rpm',
              transmission: 'Tự động 10 cấp',
              drivetrain: '4WD (Dẫn động 4 bánh)',
              dimensions: '5370 x 1918 x 1884',
              wheelbase: 3270,
              fuel_tank_capacity: 80,
              seating_capacity: 5,
              ground_clearance: 235,
              front_lights: 'LED Matrix',
              daytime_lights: 'LED dạng chữ C',
              airbags_count: 7,
              braking_system: 'Đĩa thông gió',
              esp_tc: 'ESP + Kiểm soát lực kéo',
              seat_material: 'Da cao cấp',
              parking_camera: 'Camera 360 độ',
              rear_trunk: 'Nắp thùng điện tự động',
              adas_features: 'Cảnh báo va chạm, Phanh khẩn cấp, Giữ làn, Kiểm soát hành trình thích ứng',
            },
            {
              name: 'Ford Ranger Thế Hệ Mới — Wildtrak 3.0L V6 AT 4x4',
              image_url: '/uploads/cars/ranger/versions/ford_ranger_moi_2026_wildtrak_3_0.png',
              base_price: '1199000000',
              short_desc: 'Phiên bản Wildtrak đỉnh cao với động cơ V6 3.0L siêu mạnh.',
              display_order: 6,
              is_visible: true,
              engine_type: 'Dầu 3.0L V6 Turbo',
              max_power: '250 HP',
              max_torque: '600 Nm',
              transmission: 'Tự động 10 cấp',
              drivetrain: '4WD (Dẫn động 4 bánh)',
              dimensions: '5370 x 1918 x 1884',
              wheelbase: 3270,
              fuel_tank_capacity: 80,
              seating_capacity: 5,
              ground_clearance: 235,
              front_lights: 'LED Matrix',
              daytime_lights: 'LED dạng chữ C',
              airbags_count: 8,
              braking_system: 'Đĩa thông gió',
              esp_tc: 'ESP + Kiểm soát lực kéo + Hill Descent',
              seat_material: 'Da cao cấp',
              parking_camera: 'Camera 360 độ',
              adas_features: 'ADAS cấp 2 đầy đủ: Cảnh báo va chạm, Phanh khẩn cấp, Giữ làn, ACC, Hỗ trợ đỗ xe',
            },
          ],
          colors: [
            { color_name: 'Màu color_d75050', hex_code: '#d75050', is_default: true, image_url: '/uploads/cars/ranger/colors/ranger_mau_color_d75050.png' },
            { color_name: 'Màu color_464444', hex_code: '#464444', is_default: false, image_url: '/uploads/cars/ranger/colors/ranger_mau_color_464444.png' },
            { color_name: 'Màu color_ffffff', hex_code: '#ffffff', is_default: false, image_url: '/uploads/cars/ranger/colors/ranger_mau_color_ffffff.png' },
            { color_name: 'Màu color_4b4949', hex_code: '#4b4949', is_default: false, image_url: '/uploads/cars/ranger/colors/ranger_mau_color_4b4949.png' },
            { color_name: 'Màu color_000000', hex_code: '#000000', is_default: false, image_url: '/uploads/cars/ranger/colors/ranger_mau_color_000000.jpg' },
          ],
        },
        {
          name: 'RANGER RAPTOR THẾ HỆ MỚI',
          image_url: null,
          slug: 'ranger-raptor',
          category: 'pickup' as const,
          description: 'Bán tải hiệu suất cao hàng đầu, được thiết kế để chinh phục mọi địa hình khắc nghiệt nhất.',
          display_order: 4,
          is_visible: true,
          price_from: '1299000000',
          versions: [
            {
              name: 'Ford Ranger Raptor Thế Hệ Mới — 2.0L Bi-Turbo 4WD',
              image_url: null,
              base_price: '1299000000',
              short_desc: 'Raptor phiên bản Bi-Turbo dành cho dân chơi off-road.',
              display_order: 1,
              is_visible: true,
              engine_type: 'Dầu 2.0L Bi-Turbo',
              max_power: '210 HP @ 3750 rpm',
              max_torque: '500 Nm @ 1750-2000 rpm',
              transmission: 'Tự động 10 cấp',
              drivetrain: '4WD Full-time',
              dimensions: '5370 x 2028 x 1922',
              wheelbase: 3270,
              fuel_tank_capacity: 80,
              seating_capacity: 5,
              ground_clearance: 272,
              front_lights: 'LED Matrix',
              daytime_lights: 'LED dạng chữ C',
              airbags_count: 7,
              braking_system: 'Đĩa thông gió lớn',
              esp_tc: 'ESP + Kiểm soát lực kéo + 7 chế độ lái',
              seat_material: 'Da cao cấp phối Suede',
              parking_camera: 'Camera 360 độ',
              adas_features: 'Phanh khẩn cấp, Giữ làn, Kiểm soát hành trình thích ứng',
            },
            {
              name: 'Ford Ranger Raptor Thế Hệ Mới — 3.0L V6 Twin-Turbo',
              image_url: null,
              base_price: '1529000000',
              short_desc: 'Quái thú V6 Twin-Turbo 397 mã lực, đỉnh cao bán tải hiệu suất.',
              display_order: 2,
              is_visible: true,
              engine_type: 'Xăng 3.0L V6 Twin-Turbo EcoBoost',
              max_power: '397 HP @ 5650 rpm',
              max_torque: '583 Nm @ 3500 rpm',
              transmission: 'Tự động 10 cấp',
              drivetrain: '4WD Full-time',
              dimensions: '5370 x 2028 x 1922',
              wheelbase: 3270,
              fuel_tank_capacity: 80,
              seating_capacity: 5,
              ground_clearance: 272,
              front_lights: 'LED Matrix tự động thích ứng',
              daytime_lights: 'LED dạng chữ C',
              airbags_count: 8,
              braking_system: 'Đĩa thông gió lớn Brembo',
              esp_tc: 'ESP + Kiểm soát lực kéo + 7 chế độ lái + Trail Control',
              seat_material: 'Da Nappa phối Suede thể thao',
              parking_camera: 'Camera 360 độ',
              adas_features: 'ADAS cấp 2 đầy đủ',
            },
          ],
          colors: [
            { color_name: 'Xanh Performance', hex_code: '#0D47A1', is_default: true, image_url: '/uploads/cars/ranger-raptor/colors/raptor_mau_color_0c26a6.png' },
            { color_name: 'Đen Shadow', hex_code: '#1A1A1A', is_default: false, image_url: '/uploads/cars/ranger-raptor/colors/raptor_mau_color_000000.png' },
            { color_name: 'Trắng Arctic', hex_code: '#F5F5F0', is_default: false, image_url: '/uploads/cars/ranger-raptor/colors/raptor_mau_color_ffffff.png' },
            { color_name: 'Đỏ Code Orange', hex_code: '#D84315', is_default: false, image_url: '/uploads/cars/ranger-raptor/colors/raptor_mau_color_cd4e18.webp' },
            { color_name: 'Xám Conquer', hex_code: '#616161', is_default: false, image_url: '/uploads/cars/ranger-raptor/colors/raptor_mau_color_454545.png' },
          ],
        },
        {
          name: 'TRANSIT HOÀN TOÀN MỚI',
          image_url: null,
          slug: 'transit',
          category: 'commercial' as const,
          description: 'Xe thương mại 16-18 chỗ hàng đầu, lựa chọn số 1 cho vận tải hành khách và doanh nghiệp.',
          display_order: 5,
          is_visible: true,
          price_from: '905000000',
          versions: [
            {
              name: 'Ford Transit Hoàn Toàn Mới — Trend 16 chỗ',
              image_url: '/uploads/cars/transit/versions/ford_transit_the_he_moi_trend_16_cho.png',
              base_price: '905000000',
              short_desc: 'Phiên bản tiêu chuẩn 16 chỗ, tối ưu cho vận tải hành khách.',
              display_order: 1,
              is_visible: true,
              engine_type: 'Dầu 2.0L Turbo',
              max_power: '136 HP',
              max_torque: '385 Nm',
              transmission: 'Sàn 6 cấp',
              drivetrain: 'RWD (Cầu sau)',
              dimensions: '5981 x 2000 x 2545',
              wheelbase: 3750,
              fuel_tank_capacity: 75,
              seating_capacity: 16,
              ground_clearance: 175,
              front_lights: 'Halogen Reflector',
              airbags_count: 2,
              braking_system: 'Đĩa thông gió (trước) / Tang trống (sau)',
              esp_tc: 'ESP + Kiểm soát lực kéo',
              air_conditioning: 'Điều hòa kép trước sau',
            },
            {
              name: 'Ford Transit Hoàn Toàn Mới — Premium 16 chỗ',
              image_url: '/uploads/cars/transit/versions/ford_transit_the_he_moi_premium_16_cho.png',
              base_price: '985000000',
              short_desc: 'Phiên bản nâng cấp 16 chỗ với tiện nghi tốt hơn.',
              display_order: 2,
              is_visible: true,
              engine_type: 'Dầu 2.0L Turbo',
              max_power: '136 HP',
              max_torque: '385 Nm',
              transmission: 'Sàn 6 cấp',
              drivetrain: 'RWD (Cầu sau)',
              dimensions: '5981 x 2000 x 2545',
              wheelbase: 3750,
              fuel_tank_capacity: 75,
              seating_capacity: 16,
              ground_clearance: 175,
              front_lights: 'LED Projector',
              airbags_count: 2,
              braking_system: 'Đĩa thông gió (trước) / Tang trống (sau)',
              esp_tc: 'ESP + Kiểm soát lực kéo',
              air_conditioning: 'Điều hòa kép độc lập trước sau',
              parking_camera: 'Camera lùi',
            },
            {
              name: 'Ford Transit Hoàn Toàn Mới — Premium+ 18 chỗ',
              image_url: '/uploads/cars/transit/versions/ford_transit_the_he_moi_premium_18_cho.png',
              base_price: '1070000000',
              short_desc: 'Phiên bản cao cấp 18 chỗ, tối ưu cho doanh nghiệp vận tải lớn.',
              display_order: 3,
              is_visible: true,
              engine_type: 'Dầu 2.0L Turbo',
              max_power: '136 HP',
              max_torque: '385 Nm',
              transmission: 'Sàn 6 cấp',
              drivetrain: 'RWD (Cầu sau)',
              dimensions: '6355 x 2000 x 2545',
              wheelbase: 3750,
              fuel_tank_capacity: 75,
              seating_capacity: 18,
              ground_clearance: 175,
              front_lights: 'LED Projector',
              airbags_count: 2,
              braking_system: 'Đĩa thông gió (trước) / Tang trống (sau)',
              esp_tc: 'ESP + Kiểm soát lực kéo',
              air_conditioning: 'Điều hòa kép độc lập + quạt hàng ghế sau',
              parking_camera: 'Camera lùi',
            },
          ],
          colors: [
            { color_name: 'Màu color_4c4344', hex_code: '#4c4344', is_default: true, image_url: '/uploads/cars/transit/colors/transit_mau_color_4c4344.png' },
            { color_name: 'Màu color_b3b3b7', hex_code: '#b3b3b7', is_default: false, image_url: '/uploads/cars/transit/colors/transit_mau_color_b3b3b7.png' },
            { color_name: 'Màu color_000000', hex_code: '#000000', is_default: false, image_url: '/uploads/cars/transit/colors/transit_mau_color_000000.png' },
            { color_name: 'Màu color_ffffff', hex_code: '#ffffff', is_default: false, image_url: '/uploads/cars/transit/colors/transit_mau_color_ffffff.png' },
            { color_name: 'Màu color_d2d2d2', hex_code: '#d2d2d2', is_default: false, image_url: '/uploads/cars/transit/colors/transit_mau_color_d2d2d2.png' },
          ],
        },
        {
          name: 'MUSTANG MACH-E',
          image_url: null,
          slug: 'mustang-mach-e',
          category: 'ev' as const,
          description: 'SUV thuần điện đầu tiên của Ford, kết hợp tinh thần Mustang với công nghệ xe điện tiên tiến nhất.',
          display_order: 6,
          is_visible: true,
          price_from: '1599000000',
          versions: [
            {
              name: 'Ford Mustang Mach-E — Premium AWD',
              image_url: null,
              base_price: '1599000000',
              short_desc: 'SUV thuần điện nhập khẩu, 480km/lần sạc, công nghệ hàng đầu.',
              display_order: 1,
              is_visible: true,
              engine_type: 'Thuần điện Dual Motor',
              max_power: '346 HP tổng hệ thống',
              max_torque: '580 Nm tức thì',
              transmission: 'Hộp số 1 cấp',
              drivetrain: 'AWD (Dẫn động 4 bánh điện)',
              dimensions: '4739 x 1881 x 1624',
              wheelbase: 2984,
              fuel_tank_capacity: 0,
              seating_capacity: 5,
              ground_clearance: 150,
              front_lights: 'LED Projector thích ứng',
              daytime_lights: 'LED dải 3 thanh Mustang',
              airbags_count: 8,
              braking_system: 'Đĩa thông gió lớn + Phanh tái sinh',
              esp_tc: 'ESP + Kiểm soát lực kéo + One Pedal Driving',
              seat_material: 'Da tổng hợp cao cấp',
              sunroof: 'Kính trần toàn cảnh cố định',
              screens_system: 'Màn hình trung tâm 15.5 inch dọc + Bảng đồng hồ 10.2 inch',
              parking_camera: 'Camera 360 độ',
              adas_features: 'Ford Co-Pilot360 2.0: Cruise thích ứng, Giữ làn, Phanh khẩn cấp, Cảnh báo điểm mù, Hỗ trợ đỗ xe tự động',
            },
          ],
          colors: [
            { color_name: 'Màu color_9a2d2d', hex_code: '#9a2d2d', is_default: true, image_url: '/uploads/cars/mustang-mach-e/colors/mustang-mach-e_mau_color_9a2d2d.png' },
            { color_name: 'Màu color_075430', hex_code: '#075430', is_default: false, image_url: '/uploads/cars/mustang-mach-e/colors/mustang-mach-e_mau_color_075430.png' },
            { color_name: 'Màu color_ffffff', hex_code: '#ffffff', is_default: false, image_url: '/uploads/cars/mustang-mach-e/colors/mustang-mach-e_mau_color_ffffff.png' },
            { color_name: 'Màu color_000000', hex_code: '#000000', is_default: false, image_url: '/uploads/cars/mustang-mach-e/colors/mustang-mach-e_mau_color_000000.png' },
          ],
        },
      ];

      // ============================================================
      // SEED EXECUTION
      // ============================================================
      console.log('🚗 Starting car data seed...');

      for (const carData of carsData) {
        const { versions, colors, ...carFields } = carData;

        // Create Car
        const createdCar = await strapi.documents('api::car.car').create({
          data: carFields as any,
          status: 'published',
        });
        console.log(`  ✅ Car: ${carData.name} (${createdCar.documentId})`);

        // Create Versions for this Car
        for (const versionData of versions) {
          const createdVersion = await strapi.documents('api::version.version').create({
            data: {
              ...versionData,
              car: createdCar.documentId,
            } as any,
            status: 'published',
          });
          console.log(`    📦 Version: ${versionData.name}`);

          // Create Colors for each Version
          for (let i = 0; i < colors.length; i++) {
            const colorData = colors[i];
            await strapi.documents('api::version-color.version-color').create({
              data: {
                color_name: colorData.color_name,
                hex_code: colorData.hex_code,
                image_url: (colorData as any).image_url || null,
                is_default: colorData.is_default,
                display_order: i + 1,
                version: createdVersion.documentId,
              } as any,
            });
          }
        }
        console.log(`  🎨 ${colors.length} colors added to all versions of ${carData.name}`);
      }

      console.log('');
      console.log('🎉 ===== DATA SEED COMPLETE =====');
      console.log(`   6 Dòng xe, 20 Phiên bản, ~110 Bản ghi màu sắc`);
      console.log('================================');

    } catch (e) {
      console.error('❌ Bootstrap/Seed error:', e);
    }
  },
};
