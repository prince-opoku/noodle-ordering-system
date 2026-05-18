import { createClient }
from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl =
'https://nkdtpyoobdoeslrqgzee.supabase.co';

const supabaseKey =
' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rZHRweW9vYmRvZXNscnFnemVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY1MzE5MSwiZXhwIjoyMDk0MjI5MTkxfQ.y5Rn-rKhhISaZ4QHDtvno_K5g9a98xkKkgOXufECB6g  ';

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

/* PAGES */

const customerPage =
document.getElementById(
  'customerPage'
);

const loginPage =
document.getElementById(
  'loginPage'
);

const adminPage =
document.getElementById(
  'adminPage'
);

/* CUSTOMER */

const form =
document.getElementById(
  'orderForm'
);

const statusDiv =
document.getElementById(
  'status'
);

/* LOGIN */

const loginForm =
document.getElementById(
  'loginForm'
);

const loginMessage =
document.getElementById(
  'loginMessage'
);

/* ADMIN */

const ordersDiv =
document.getElementById(
  'orders'
);

const logoutBtn =
document.getElementById(
  'logoutBtn'
);

const ADMIN_PASSWORD =
'noodleadmin123';

/* PRICING */

const quantityInput =
document.getElementById(
  'quantity'
);

const customPriceInput =
document.getElementById(
  'customPrice'
);

const totalPrice =
document.getElementById(
  'totalPrice'
);

const priceMessage =
document.getElementById(
  'priceMessage'
);

function getMinimumPrice() {

  const food =
  document.getElementById(
    'food'
  ).value;

  if (
    food === 'Indomie'
  ) {

    return 20;
  }

  return 10;
}

function calculatePrice() {

  const quantity =
  parseInt(
    quantityInput.value
  ) || 1;

  const customPrice =
  parseInt(
    customPriceInput.value
  ) || 0;

  const minimumPrice =
  getMinimumPrice();

  let finalPrice =
  customPrice;

  if (
    customPrice < minimumPrice
  ) {

    finalPrice =
    minimumPrice;
  }

  const total =
  finalPrice * quantity;

  totalPrice.innerText =
  total;

  priceMessage.innerHTML = `

    Minimum price for

    ${document.getElementById(
      'food'
    ).value}

    is ₵${minimumPrice}

  `;
}

quantityInput?.addEventListener(
  'input',
  calculatePrice
);

customPriceInput?.addEventListener(
  'input',
  calculatePrice
);

document.getElementById(
  'food'
).addEventListener(
  'change',
  calculatePrice
);

calculatePrice();

/* ROUTING */

const params =
new URLSearchParams(
  window.location.search
);

const mode =
params.get('page');

if (
  mode === 'admin'
) {

  customerPage.classList.add(
    'hidden'
  );

  loginPage.classList.remove(
    'hidden'
  );

} else {

  customerPage.classList.remove(
    'hidden'
  );
}

/* ADMIN LOGIN */

loginForm?.addEventListener(
  'submit',

  (e) => {

    e.preventDefault();

    const password =
    document.getElementById(
      'password'
    ).value;

    if (
      password ===
      ADMIN_PASSWORD
    ) {

      localStorage.setItem(
        'adminAuthenticated',
        'true'
      );

      loginPage.classList.add(
        'hidden'
      );

      adminPage.classList.remove(
        'hidden'
      );

      loadOrders();

    } else {

      loginMessage.innerHTML = `
        <p style="color:red;">
          Wrong Password
        </p>
      `;
    }
  }
);

/* AUTO LOGIN */

if (

  mode === 'admin' &&

  localStorage.getItem(
    'adminAuthenticated'
  ) === 'true'

) {

  loginPage.classList.add(
    'hidden'
  );

  adminPage.classList.remove(
    'hidden'
  );

  loadOrders();
}

/* LOGOUT */

logoutBtn?.addEventListener(
  'click',

  () => {

    localStorage.removeItem(
      'adminAuthenticated'
    );

    location.reload();
  }
);

/* QUEUE */

function generateQueue() {

  return 'Q' + Math.floor(
    Math.random() * 9000 + 1000
  );
}

/* PLACE ORDER */

form?.addEventListener(
  'submit',

  async (e) => {

    e.preventDefault();

    const toppings = [];

    document

      .querySelectorAll(
        '.topping:checked'
      )

      .forEach(item => {

        toppings.push(
          item.value
        );
      });

    const quantity =
    parseInt(
      quantityInput.value
    ) || 1;

    const customPrice =
    parseInt(
      customPriceInput.value
    ) || 0;

    const minimumPrice =
    getMinimumPrice();

    let finalPrice =
    customPrice;

    if (
      customPrice <
      minimumPrice
    ) {

      finalPrice =
      minimumPrice;
    }

    const total =
    finalPrice * quantity;

    const order = {

      queue:
      generateQueue(),

      food:
      document.getElementById(
        'food'
      ).value,

      pepper:
      document.getElementById(
        'pepper'
      ).value,

      packaging:
      document.getElementById(
        'packaging'
      ).value,

      toppings:
      toppings.join(', '),

      quantity:
      quantity,

      total:
      total,

      status:
      'Waiting'
    };

    const {
      data,
      error
    } = await supabase

      .from('orders')

      .insert([order])

      .select();

    if (error) {

      console.log(error);

      alert(
        'Error placing order'
      );

      return;
    }

    const savedOrder =
    data[0];

    localStorage.setItem(
      'orderId',
      savedOrder.id
    );

    showCustomerStatus(
      savedOrder
    );

    watchOrder(
      savedOrder.id
    );
  }
);

/* CUSTOMER STATUS */

function showCustomerStatus(
  order
) {

  statusDiv.innerHTML = `

    <h2>
      ${order.queue}
    </h2>

    <p>

      Status:

      <strong>
        ${order.status}
      </strong>

    </p>

    <p>

      Total:

      <strong>
        ₵${order.total}
      </strong>

    </p>
  `;
}

/* GET ORDER */

async function getOrder(id) {

  const { data } =
  await supabase

    .from('orders')

    .select('*')

    .eq('id', id)

    .maybeSingle();

  return data;
}

/* WATCH ORDER */

function watchOrder(id) {

  setInterval(

    async () => {

      const order =
      await getOrder(id);

      if (!order) {

        statusDiv.innerHTML = `

          <h2>
            Completed
          </h2>

          <p>
            Your food is ready
            for pickup.
          </p>
        `;

        return;
      }

      showCustomerStatus(
        order
      );

    },

    3000
  );
}

/* EXISTING ORDER */

const existingOrderId =
localStorage.getItem(
  'orderId'
);

if (
  existingOrderId
) {

  watchOrder(
    existingOrderId
  );
}

/* LOAD ORDERS */

async function loadOrders() {

  const { data } =
  await supabase

    .from('orders')

    .select('*')

    .order('id', {

      ascending: false
    });

  ordersDiv.innerHTML = '';

  data.forEach(order => {

    ordersDiv.innerHTML += `

      <div class="order-card">

        <h2>
          ${order.queue}
        </h2>

        <p>
          <strong>
            Food:
          </strong>

          ${order.food}
        </p>

        <p>
          <strong>
            Pepper:
          </strong>

          ${order.pepper}
        </p>

        <p>
          <strong>
            Packaging:
          </strong>

          ${order.packaging}
        </p>

        <p>
          <strong>
            Toppings:
          </strong>

          ${order.toppings}
        </p>

        <p>
          <strong>
            Quantity:
          </strong>

          ${order.quantity}
        </p>

        <p>
          <strong>
            Total:
          </strong>

          ₵${order.total}
        </p>

        <p>
          <strong>
            Status:
          </strong>

          ${order.status}
        </p>

        <button

          onclick="
          updateStatus(
            ${order.id},
            'Cooking'
          )"

        >

          Cooking

        </button>

        <button

          onclick="
          updateStatus(
            ${order.id},
            'Ready'
          )"

        >

          Ready

        </button>

        <button

          onclick="
          completeOrder(
            ${order.id}
          )"

        >

          Completed

        </button>

      </div>
    `;
  });
}

/* UPDATE STATUS */

window.updateStatus =
async function(
  id,
  status
) {

  await supabase

    .from('orders')

    .update({

      status
    })

    .eq('id', id);

  loadOrders();
};

/* COMPLETE ORDER */

window.completeOrder =
async function(id) {

  await supabase

    .from('orders')

    .delete()

    .eq('id', id);

  loadOrders();
};

/* REALTIME */

supabase

  .channel(
    'orders-channel'
  )

  .on(

    'postgres_changes',

    {
      event: '*',
      schema: 'public',
      table: 'orders'
    },

    () => {

      if (

        localStorage.getItem(
          'adminAuthenticated'
        )

        === 'true'

      ) {

        loadOrders();
      }
    }
  )

  .subscribe();
