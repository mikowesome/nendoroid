// VARIABLES

const cartBtn = document.querySelector('.cart-btn')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
const cartDOM = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const productsDOM = document.querySelector('.products-center')

// Cart
let cart = []
// buttons
let buttonsDOM = []

// Getting the products
class Products {
    async getProducts() {
        try {
            let result = await fetch('products.json')
            let data = await result.json()
            let products = data.items
            products = products.map( item => {
                const {title, price} = item.fields
                const image = item.fields.image.fields.file.url
                const {id} = item.sys
                return {title, price, id, image}
            })
            return products
        } catch (error) {
            console.log(error)
        }
    }
}

// Display Products
class UI {
    displayProducts(products) {
        let result = ``
        products.forEach( product => {
            const title = product.title
            const id = product.id
            const price = product.price
            const image = product.image
            
            result += `<!-- SINGLE PRODUCT -->

            <article class="product">
                <div class="img-container">
                    <img src="${image}" alt="${title} image" class="product-img">
                    <button class="bag-btn" data-id=${id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${title}</h3>
                <h4>¥${price}</h4>
            </article>

            <!-- END OF SINGLE PRODUCT -->`
        })
        productsDOM.innerHTML = result
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll('.bag-btn')]
        buttonsDOM = buttons
        buttons.forEach(button => {
            const id = button.dataset.id
            let inCart = cart.find(item => item.id === id)
            if (inCart) {
                button.textContent = 'in cart'
                button.disabled = true
            } 
            button.addEventListener('click', (event) => {
                event.target.textContent = 'in cart'
                event.target.disabled = true
                // get product from products based on the id of the button
                let cartItem = {...Storage.getProduct(id), amount: 1}
                // add product to the cart
                cart = [...cart, cartItem]
                // save cart in local storage
                Storage.saveCart(cart)
                // set cart values
                this.setCartValues(cart)
                // display cart item
                this.addCartItem(cartItem)
                // show cart and overlay
                this.showCart()
            })
        })
    }
    setCartValues(cart) {
        let tempTotal = 0
        let itemsTotal = 0
        cart.map( item => {
            tempTotal += item.price * item.amount
            itemsTotal += item.amount
        })
        cartTotal.textContent = Number(tempTotal.toFixed(2))
        cartItems.textContent = itemsTotal
    }
    addCartItem(item) {
        const div = document.createElement('div')
        div.classList.add('cart-item')
        div.innerHTML = `
        <img src="${item.image}" alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>¥${item.price}</h5>  
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>
        `
        cartContent.appendChild(div)
    }
    showCart() {
        cartDOM.classList.add('showCart')
        cartOverlay.classList.add('transparentBcg')
    }
    hideCart() {
        cartDOM.classList.remove('showCart')
        cartOverlay.classList.remove('transparentBcg')
    }
    setupAPP() {
        cart = Storage.getCart()
        this.setCartValues(cart)
        this.populateCart(cart)
        cartBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click', this.hideCart)
    }
    populateCart(cart) {
        cart.forEach( item => this.addCartItem(item))
    }
    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart()
        })
        cartContent.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target
                let id = removeItem.dataset.id
                cartContent.removeChild((removeItem.parentElement.parentElement));
                this.removeItem(id)
            } else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target
                let id = addAmount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount++
                Storage.saveCart(cart)
                this.setCartValues(cart)
                addAmount.nextElementSibling.textContent = tempItem.amount
            } else if (event.target.classList.contains('fa-chevron-down')) {
                let decreaseAmount = event.target
                let id = decreaseAmount.dataset.id
                let tempItem = cart.find( item => item.id === id)
                if (tempItem.amount <= 1) return
                tempItem.amount--
                Storage.saveCart(cart)
                this.setCartValues(cart)
                decreaseAmount.previousElementSibling.textContent = tempItem.amount
            }
        })
    }
    clearCart() {
        let cartItems = cart.map( item => item.id)
        cartItems.forEach( id => this.removeItem(id))
        cartContent.innerHTML = ``
        this.hideCart()
    }
    removeItem(id) {
        
        cart = cart.filter( item => item.id !== id)
        this.setCartValues(cart)
        Storage.saveCart(cart)
        let button = this.getSingleButton(id)
        button.disabled = false
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>
        add to cart`
    }
    getSingleButton(id) {
        return buttonsDOM.find( button => button.dataset.id === id)
    }
}

// Local Storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products))
    }
    // parameter passed is the id that we will be getting from the button
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(product => product.id === id)
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI()
    const products = new Products()
    // setup app
    ui.setupAPP()
    products.getProducts().then( products => {
        ui.displayProducts(products)
        Storage.saveProducts(products)
    }).then( () => {
        ui.getBagButtons()
        ui.cartLogic()
    })
})