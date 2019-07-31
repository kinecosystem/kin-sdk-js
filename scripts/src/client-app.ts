/// <reference path ="./client.ts"/>

(function(){
    const KinSdk = window.KinSdk;
    const env = KinSdk.Environment.Testnet;
    const client = new KinSdk.KinClient(env, );
    const payBtn = <HTMLButtonElement>document.getElementById('pay-with-kin');

    payBtn.addEventListener('click', ev => {

    });
    console.log(client);


})();