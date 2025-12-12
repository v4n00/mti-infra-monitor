import { get } from "http";

let backendurl = process.env.BACKEND_URL || 'http://localhost:2000';
let frontendurl = process.env.FRONTEND_URL || 'http://localhost:3000';
let token = "";

const getRandomMs = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getTimeMultiplier = () => {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    const peakHour = 15;
    const diff = (hour - peakHour + 24) % 24;
    return 0.5 + 0.5 * Math.cos(2 * Math.PI * diff / 24);
}

const generateEmailAndPassword = () => {
    let email = `user${Math.floor(Math.random() * 100000)}@example${Math.floor(Math.random() * 100000)}.com`;
    let password = 'password123';
    return [email, password];
}

const register = async (email, password) => {
    if (!email || !password) {
        [email, password] = generateEmailAndPassword();
    }

    await fetch(`${backendurl}/api/users/signup`,  {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
}

const login = async (email, password) => {
    const response = await fetch(`${backendurl}/api/users/login`,  {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if(data && data.token) token = data.token;
}

const validate = async (token) => {
    await fetch(`${backendurl}/api/users/validate`,  {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
}

const getProducts = async () => {
    await fetch(`${backendurl}/api/products`,  {
        method: 'GET',
    });
}

const getProduct = async (id) => {
    if (!id) id = Math.floor(Math.random() * 25) + 1;
    await fetch(`${backendurl}/api/products/${id}`,  {
        method: 'GET',
    });
}

const setOrder = async (token) => {
    const products = [
        { productId: 1, quantity: 2 },
        { productId: 5, quantity: 1 },
        { productId: 12, quantity: 4 },
    ]

    await fetch(`${backendurl}/api/orders`,  {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ products }),
    });
}

const getOrders = async (token) => {
    await fetch(`${backendurl}/api/orders`,  {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
}

const requestFrontend = async () => {
    await fetch(`${frontendurl}/`,  {
        method: 'GET',
    });
}

const chaosCacheMiss = async () => {
    const randomId = Math.floor(Math.random() * 1000000) + 1000; 
    await fetch(`${backendurl}/api/products/${randomId}`, {
        method: 'GET',
    }).catch(() => {});
}

const spike = async (fn, baseIntervalMs, spikeDurationMs, spikeIntervalMs, spikeIntervalRandom) => {
    while (true) {
        await new Promise(resolve => setTimeout(resolve, spikeIntervalMs * 1000 + getRandomMs(0, spikeIntervalRandom * 1000)));
        const endTime = Date.now() + spikeDurationMs * 1000;
        while (Date.now() < endTime) {
            await fn();
            const multiplier = getTimeMultiplier();
            const intervalMs = baseIntervalMs * multiplier;
            await new Promise(resolve => setTimeout(resolve, intervalMs * 1000));
        }
    }
}

const runRandomMs = async (fn, baseMinInterval, baseMaxInterval) => {
    spike(fn, baseMinInterval / 5, 5, 1200, 600);
    spike(fn, 2, 5, 300, 200);
    while (true) {
        await fn();
        const multiplier = getTimeMultiplier();
        const minInterval = baseMinInterval * multiplier;
        const maxInterval = baseMaxInterval * multiplier;
        const interval = getRandomMs(minInterval * 1000, maxInterval * 1000);
        await new Promise(resolve => setTimeout(resolve, interval));
    }
}

const main = async () => {
    let globalEmail, globalPassword;
    [globalEmail, globalPassword] = generateEmailAndPassword();
    console.log(`Generated global user: ${globalEmail} / ${globalPassword}`);
    await register(globalEmail, globalPassword);
    await login(globalEmail, globalPassword);

    runRandomMs(async () => await register(), 15, 25);
    runRandomMs(async () => await login(globalEmail, globalPassword), 2, 15);
    runRandomMs(async () => await login("aaa", "bbb"), 60, 90);
    runRandomMs(async () => await validate(token), 3, 11);
    runRandomMs(async () => await getProducts(), 5, 15);
    runRandomMs(async () => await getProduct(), 5, 19);
    runRandomMs(async () => await setOrder(token), 10, 20);
    runRandomMs(async () => await setOrder("invalidtoken"), 20, 40);
    runRandomMs(async () => await getOrders(token), 20, 25);
    runRandomMs(async () => await getOrders("invalidtoken"), 40, 60);
    runRandomMs(async () => await requestFrontend(), 1, 3);
    runRandomMs(async () => await getProduct("test"), 30, 100);

    console.log("Traffic generator started");
}

await main();