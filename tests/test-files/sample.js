// ❌ 테스트용 위반 코드
import { config } from '../../app/config'; // fsd-layer-imports 위반
import { Button } from '../../shared/ui/Button'; // fsd-path-alias 위반
import { authSlice } from '../../features/auth/slice.ts'; // fsd-public-api 위반
import { processPayment } from '../../features/payment'; // fsd-slices-dependency 위반
import { ProfileCard } from '../../widgets/ProfileCard'; // fsd-no-cross-ui 위반
import { store } from '../../app/store'; // fsd-no-global-store 위반