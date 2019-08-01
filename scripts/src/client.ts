import * as KinSdk from './index'

declare global{
    interface Window {
        KinSdk: any;
    }
}

window.KinSdk = KinSdk;
export default KinSdk;
