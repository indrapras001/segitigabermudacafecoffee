document.addEventListener('alpine:init', () => {
  Alpine.data('products', () => ({
    items: [
      {
        id: 1,
        name: 'Kopi Bermuda',
        img: 'P1.jpg',
        price: 23000,
      },
      {
        id: 2,
        name: 'Ice Latte',
        img: 'P2.jpg',
        price: 29000,
      },
      {
        id: 3,
        name: 'Americano Lemonade',
        img: 'P3.jpg',
        price: 29000,
      },
      {
        id: 4,
        name: 'Matcha Latte',
        img: 'P4.jpg',
        price: 29000,
      },
      {
        id: 5,
        name: 'BerryPop',
        img: 'P5.jpg',
        price: 32000,
      },
      {
        id: 6,
        name: 'Pecak Nila',
        img: 'P6.jpg',
        price: 65000,
      },
      {
        id: 7,
        name: 'Pecak Gurame',
        img: 'P7.jpg',
        price: 85000,
      },
      {
        id: 8,
        name: 'Nasi Goreng Seafood',
        img: 'P8.jpg',
        price: 45000,
      },
      {
        id: 9,
        name: 'Iga Pindang',
        img: 'P9.jpg',
        price: 85000,
      },
      {
        id: 10,
        name: 'Sapi Lada Hitam',
        img: 'P10.jpg',
        price: 65000,
      },
    ],
  }));

  Alpine.store('cart', {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      // apakah ada barang yang sama
      const cartItem = this.items.find((item) => item.id === newItem.id);

      // jika barang tersebut belum ada
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        // jika barang nya sudah ada, cek apakah barang tersebut sama atau sudah ada
        this.items = this.items.map((item) => {
          // jika barang tersebut berbeda
          if (item.id !== newItem.id) {
            return item;
          } else {
            // jika barang sudah ada, tambah quantity dan totalnya
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },

    remove(id) {
      //ambil item yang ingin diremove berdasarkan id
      const cartItem = this.items.find((item) => item.id === id);

      // jika item lebih dari 1
      if (cartItem.quantity > 1) {
        // telusuri satu-satu
        this.items = this.items.map((item) => {
          // jika bukan barang yang di click skip aja
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity === 1) {
        //jika barangnya sisa 1
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
      }
    },
  });
});

// form validasi
const checkoutButton = document.querySelector('.checkout-button');
checkoutButton.disabled = true;

const form = document.querySelector('#checkoutForm');
form.addEventListener('keyup', function () {
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.length !== 0) {
      checkoutButton.classList.remove('disabled');
      checkoutButton.classList.add('disabled');
    } else {
      return false;
    }
  }

  checkoutButton.disabled = false;
  checkoutButton.classList.remove('disabled');
});

//kirim data pada saat tombol checkpout di klik
checkoutButton.addEventListener('click', async function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);
  // const message = formatMessage(objData);
  // window.open('https://wa.me/6281382152673?text=' + encodeURIComponent(message));

  //minta transiction token menggunakan ajax/fetch
  try {
    const response = await fetch('php/placeOrder.php', {
      method: 'POST',
      body: data,
    });
    const token = await response.text();
    // console.log(token);
    window.snap.pay(token);
  } catch (err) {
    console.log(err.message);
  }
});

//format pesan whatsapp
const formatMessage = (obj) => {
  return `Data Customer
  Nama: ${obj.name}
  Email: ${obj.email}
  No Hp: ${obj.phone}

  Data Pesanan 
  ${JSON.parse(obj.items).map((item) => `${item.name}(${item.quantity} x ${rupiah(item.total)}) \n`)}
  TOTAL: ${rupiah(obj.total)}
  Terimakasih.`;
};

// konversi ke Rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};
