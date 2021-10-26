// Простой скрипт, создающей виртуальное устройство, определяющее через ping
//  наличие подключения к определенным серверам.
//  Я использую это для автоматизаций — чтобы понимать в сети ли сейчас WB или
//  приходится рассчитывать только на себя =)

defineVirtualDevice("internet", { // Название устройства, так будет выглядеть и mqtt топик
    title:"Internet status", // Описание, показывается в "устройствах" веб-интерфейса
    cells: {
        "Internet": { // Интернет
            type: "text",
            value: ""
        },
        "Ethernet": { // Локальная сеть, пингуем роутер
            type: "text",
            value: ""
        },
        "VPN": { // VPN если есть, пингуем сервер VPN по его внутреннему IP-адресу
            type: "text",
            value: ""
        }
    }
});

// Основная функция, на входе имя из перечня выше и адрес. Кроме IP вполне можно использовать человеческое имя вроде yandex.ru

function _system_update_internet(name, address) {
   // Запускаем пинг с одной попыткой, при плохом соединение будет ошибка. На то и расчёт! =) Не устраивает — "c 1" можно поменять, это количество попыток, "W 1" — время в секундах до ожидания ответа. То есть при пинге > 1000 однозначно будет ошибка.
   runShellCommand('ping -c 1 -W 1 ' + address + ' > /dev/null; if [ $? -eq 0 ]; then echo \'Online\'; else echo \"Offline\"; fi', {
      captureOutput: true,
      exitCallback: function (exitCode, capturedOutput) {
        //log(address + ' ' + capturedOutput); // раскомментировать строку для дебага
        dev.internet[name] = capturedOutput;
      }
  });
};

// Функция для проверки всего сразу

function _system_update_internet_all() {
    _system_update_internet("Internet", "8.8.8.8"); // проверяем интернет
    _system_update_internet("Ethernet", "192.168.1.1"); // проверяем роутер
    _system_update_internet("VPN", "10.8.0.1"); // проверяем VPN-сервер
};

// Запускаем
_system_update_internet_all();

// Цикл на 60 секунд, то есть проверяем раз в минуту
setInterval(_system_update_internet_all, 60000);
