export type CartItem = {
    id: string;
    slug: string;
    name: string;
    price: number;
    quantity: number;
    stock: number;
    imageUrl: string | null;
    material: string | null;
};

export const CART_STORAGE_KEY = "joyeria-lezcano-cart";

export function getCart(): CartItem[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

        if (!storedCart) {
            return [];
        }

        const parsedCart = JSON.parse(storedCart);

        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch {
        return [];
    }
}

export function saveCart(cart: CartItem[]) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
    );

    window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: CartItem) {
    const cart = getCart();

    const existingItem = cart.find(
        (cartItem) => cartItem.id === item.id
    );

    if (existingItem) {
        existingItem.quantity = Math.min(
            existingItem.quantity + item.quantity,
            item.stock
        );
    } else {
        cart.push({
            ...item,
            quantity: Math.min(item.quantity, item.stock),
        });
    }

    saveCart(cart);
}

export function removeFromCart(productId: string) {
    const cart = getCart().filter(
        (item) => item.id !== productId
    );

    saveCart(cart);
}

export function updateCartQuantity(
    productId: string,
    quantity: number
) {
    const cart = getCart();

    const item = cart.find(
        (cartItem) => cartItem.id === productId
    );

    if (!item) {
        return;
    }

    if (quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    item.quantity = Math.min(quantity, item.stock);

    saveCart(cart);
}

export function clearCart() {
    saveCart([]);
}

export function getCartCount() {
    return getCart().reduce(
        (total, item) => total + item.quantity,
        0
    );
}