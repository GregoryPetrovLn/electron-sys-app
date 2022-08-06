const path = require('path');
const { cpu, mem, os } = require('node-os-utils');
const { ipcRenderer } = require('electron');
let cpuOverload;
let alertFrequency;

//Get settings & values
ipcRenderer.on('settings:get', (e, settings) => {
  cpuOverload = +settings.cpuOverload;
  alertFrequency = +settings.alertFrequency;
});

//Run every 2 seconds
setInterval(() => {
  //CPU Usage
  cpu.usage().then((info) => {
    document.getElementById('cpu-usage').innerText = `${info} %`;
    const cpuProgressElement = document.getElementById('cpu-progress');
    cpuProgressElement.style.width = `${info}%`;

    //Make progerss bar red if overload
    if (info >= cpuOverload) {
      cpuProgressElement.style.background = 'red';
    } else {
      cpuProgressElement.style.background = '#30c88b';
    }
    //Check overload
    if (info >= cpuOverload && runNotify(alertFrequency)) {
      notifyUser({
        title: 'CPU overload',
        body: `CPU is over ${cpuOverload}%`,
        icon: path.join(__dirname, 'img', 'tray_icon.png'),
      });
      localStorage.setItem('lastNotify', +new Date());
    }
  });

  //CPU Free
  cpu.free().then((info) => {
    document.getElementById('cpu-free').innerText = `${info} %`;
  });
  //Uptime
  document.getElementById('sys-uptime').innerText = seondsToDhms(os.uptime());
}, 2000);

//Set model
document.getElementById('cpu-model').innerText = cpu.model();

//Computer name
document.getElementById('comp-name').innerText = os.hostname();

//OS
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`;

//Total Mem
mem.info().then((info) => {
  document.getElementById('mem-total').innerText = `${info.totalMemMb} MB`;
});

//Show day, hours, mins ,sec
function seondsToDhms(seconds) {
  seconds = +seconds;
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d, ${h}h, ${m}m, ${s}s`;
}

//Send notification
function notifyUser(options) {
  new Notification(options.title, options);
}

//Check how much time has passed since notification
function runNotify(frequency) {
  if (localStorage.getItem('lastNotify') === null) {
    localStorage.setItem('lastNotify', +new Date());
    return true;
  }

  const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')));
  const now = new Date();
  const difTime = Math.abs(now - notifyTime);
  const minutesPassed = Math.ceil(difTime / (1000 * 60));

  return minutesPassed > frequency;
}
