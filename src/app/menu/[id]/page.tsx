'use client'

import { FC, useState, useEffect, useCallback, useRef } from "react";
import classes from '../Menu.module.scss';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Languages, LanguagesTitle } from '@/config/localization/Languages';
import { strings } from '@/config/localization/LocalizedStrings';
import { useAppDispatch, useAppSelector } from '@/config/Store/hooks';
import { SetLan } from '@/config/Store/Lan/LanSlice';
import AddorEditcategoryModal from './AddorEditcategoryModal';
import ItemCard from './ItemCard';
import { UserT, UserType } from '@/config/Store/User/UserType';
import AddorEditItemModal from './AddorEditItemModal';
import SettingsModal from './SettingsModal';
import NoItems from '@/Component/NoItems/NoItems';
import { SetLoad } from '@/config/Store/Load/LoadSlice';
import { AdvertisingMediaDTO, CategoryDTO, ProductDTO, RestaurantT } from '@/config/Store/Restaurant/RestaurantType';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation'
import { SetRestaurant } from '@/config/Store/Restaurant/RestaurantSlice';
import { OffersImagePath, RestaurantLogoPath, url, VideoPath } from '@/config/Api/url';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { HandleLogOut } from '@/config/HandleLogOut/HandleLogOut';
import HeadTag from '@/Component/Head/HeadTag';
import { ClearCart } from "@/config/Store/Cart/CartSlice";
import CartWidget from './CartWidget';
import { rgbToHex } from "@/app/dashboard/subscribers/ClientModal/ClientModal";
import * as signalR from "@microsoft/signalr";
import OrderStatusTracker from "./OrderStatusTracker";

// ---------------------------------------------------------------------------
// Small shared helpers (kept local to this file so nothing else has to change)
// ---------------------------------------------------------------------------

/** One toast helper instead of the same 9-line options object copy-pasted everywhere */
function notify(message: string, type: 'success' | 'error' = 'success') {
  const isAr = strings.getLanguage() === Languages.AR;
  toast[type](message, {
    position: isAr ? 'bottom-left' : 'bottom-right',
    autoClose: 2000,
    rtl: isAr,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'colored',
  });
}
function getAccentColorRgb(Restaurant: RestaurantT) {
 
  return Restaurant
    ? Restaurant.color?.startsWith?.("#")
      ? Restaurant.color
      : rgbToHex(Restaurant.color || "0,0,0")
    : "63, 63, 63";
}

/** Central place to handle "not authorized" -> logout, instead of repeating it in every catch */
function handleRequestError(err: any) {
  if (err?.response?.status === 401) {
    localStorage.clear();
    window.location.replace('/login');
    return true;
  }
  console.log(err);
  return false;
}

const authHeaders = (token: string) => ({ headers: { Authorization: token } });

export default function Page() {
  const params = useParams();
  const _Lan = useAppSelector((state) => state.Lan);
  const dispatch = useAppDispatch();

  const [CreateOrEditcategoryModal, setCreateOrEditcategoryModal] =
    useState<boolean>(false);
  const [CreateOrEditItemModal, setCreateOrEditItemModal] =
    useState<boolean>(false);
  const [SettingModal, setSettingModal] = useState<boolean>(false);
  const [EditFlag, setEditFlag] = useState<boolean>(false);

  const User = useAppSelector((state) => state.User);
  const Restaurant = useAppSelector((state) => state.Restaurant);

  const [category, setcategory] = useState<CategoryDTO[]>([]);
  const [MenuItems, setMenuItems] = useState<ProductDTO[]>([]);
  const [MenuItemsLoad, setMenuItemsLoad] = useState<boolean>(false);
  const [categoryActive, setcategoryActive] = useState<string>("");
  const router = useRouter();

  // Guards so effects only ever do their job ONCE per "cause", even under
  // React Strict Mode's dev double-invoke or accidental re-renders.
  const hasFetchedRestaurant = useRef(false);
  const hasAutoSelectedCategory = useRef(false);
  const productRequestId = useRef(0); // lets us ignore stale/out-of-order responses
  const Cart = useAppSelector((state) => state.Cart);
  const cartTotal = Cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  // tableNumber
  function PlaceOrder() {
    axios
      .post(`${url}/order`, {
        restaurantId: Restaurant.id,
        tableNumber: "1",
        items: Cart.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
      })
      .then((res) => {
        if (res.status === 200) {
          notify(
            strings.getLanguage() === Languages.AR
              ? "تم إرسال الطلب"
              : "Order placed",
          );
          dispatch(ClearCart());

          const newOrderId = res.data?.data?.id;
          if (newOrderId) {
            setCurrentOrderId(newOrderId);
            const status = res.data?.data?.status ?? "Pending";
            setOrderStatus(status);

            // Persist so it survives refresh/navigation
            localStorage.setItem(
              `activeOrder:${Restaurant.id}`,
              JSON.stringify({ orderId: newOrderId, status }),
            );
          }
        }
      })
      .catch((err) => handleRequestError(err));
  }
  // --- Restore any in-progress order for this restaurant on load ---
  useEffect(() => {
    if (!Restaurant.id) return;

    const saved = localStorage.getItem(`activeOrder:${Restaurant.id}`);
    if (!saved) return;

    try {
      const { orderId, status } = JSON.parse(saved);
      if (orderId) {
        setCurrentOrderId(orderId);
        setOrderStatus(status);
      }
    } catch {
      localStorage.removeItem(`activeOrder:${Restaurant.id}`);
    }
  }, [Restaurant.id]);

  // --- Keep localStorage in sync as status changes, clear when order is done ---
  const TERMINAL_STATUSES = ["Delivered", "Completed", "Cancelled", "Rejected"];

  useEffect(() => {
    if (!currentOrderId || !Restaurant.id) return;

    if (orderStatus && TERMINAL_STATUSES.includes(orderStatus)) {
      localStorage.removeItem(`activeOrder:${Restaurant.id}`);
      // Optionally clear from state too, after a short delay so the user
      // still sees the final status before the tracker disappears
      const t = setTimeout(() => {
        setCurrentOrderId(null);
        setOrderStatus(null);
      }, 3000);
      return () => clearTimeout(t);
    }

    localStorage.setItem(
      `activeOrder:${Restaurant.id}`,
      JSON.stringify({ orderId: currentOrderId, status: orderStatus }),
    );
  }, [orderStatus, currentOrderId, Restaurant.id]);

  // --- Live order status over SignalR --------------------------------------
  useEffect(() => {
    if (!currentOrderId) return;

    // Guards against a stale connection's async callbacks (start/.then, join,
    // rejoin-on-reconnect) touching state after a newer effect run has already
    // torn this connection down — e.g. currentOrderId changing in quick succession.
    let cancelled = false;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${url}/hubs/orders`, {
        accessTokenFactory: () => (User.token as string) ?? "",
      })
      .withAutomaticReconnect()
      .build();

    connection.on(
      "OrderStatusUpdated",
      (payload: { orderId: string; status: string }) => {
        if (!cancelled && payload.orderId === currentOrderId) {
          setOrderStatus(payload.status);
        }
      },
    );

    // withAutomaticReconnect() re-establishes the socket after a network blip,
    // but SignalR groups don't survive a reconnect — without this, the client
    // comes back online but silently stops receiving updates for this order.
    connection.onreconnected(() => {
      if (!cancelled) {
        connection.invoke("JoinOrderGroup", currentOrderId).catch(() => {});
      }
    });

    connection
      .start()
      .then(() => {
        if (cancelled) return;
        return connection.invoke("JoinOrderGroup", currentOrderId);
      })
      .catch((err: any) => console.log("SignalR connection error:", err));

    return () => {
      cancelled = true;
      connection.invoke("LeaveOrderGroup", currentOrderId).catch(() => {});
      connection.stop();
    };
  }, [currentOrderId]);
  // --- Fetch the restaurant exactly once -----------------------------------
  useEffect(() => {
    const restaurantId = params?.id as string | undefined;
    const alreadyLoaded = Restaurant && Object.keys(Restaurant).length > 0;

    if (hasFetchedRestaurant.current || alreadyLoaded || !restaurantId) return;
    hasFetchedRestaurant.current = true;

    dispatch(SetLoad(true));
    axios
      .get(`${url}/restaurant/by-id/${restaurantId}`)
      .then((response) => {
        if (response.data.statusCode === 202 && response.data.data) {
          const restaurant: RestaurantT = { ...response.data.data };
          dispatch(SetRestaurant(restaurant));
          dispatch(
            SetLan(
              restaurant.defaultLanguage === 0 ? Languages.AR : Languages.EN,
            ),
          );
        } else {
          router.replace("/");
        }
      })
      .catch((error) => {
        dispatch(SetRestaurant({})); // clear any stale restaurant so "/" doesn't bounce back
        router.replace("/");
        try {
          handleRequestError(error);
        } catch (e) {
          console.error("handleRequestError failed:", e);
        }
      })
      .finally(() => dispatch(SetLoad(false)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  // --- Keep local category/product state in sync once Restaurant arrives ---
  useEffect(() => {
    if (Restaurant.categories) {
      setcategory(Restaurant.categories);
    }
    if (Restaurant.products) {
      setMenuItems(Restaurant.products);
    }
  }, [Restaurant.categories, Restaurant.products]);

  // --- Auto-select the first category once, when categories become available
  useEffect(() => {
    if (hasAutoSelectedCategory.current || category.length === 0) return;
    hasAutoSelectedCategory.current = true;
    setcategoryActive(category[0].id);
    handleGetproduct(category[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  function HandleLanChange() {
    dispatch(SetLan(_Lan === Languages.AR ? Languages.EN : Languages.AR));
  }

  function Addcategory(categoryNameAR: string, categoryNameEN: string) {
    return new Promise((resolve, reject) => {
      axios
        .post(
          `${url}/categories/create`,
          {
            restaurantId: Restaurant?.id,
            nameAr: categoryNameAR,
            nameEn: categoryNameEN,
          },
          authHeaders(User.token as string),
        )
        .then((res) => {
          if (res.status === 200) {
            setcategory(res.data.data);
            dispatch(
              SetRestaurant({ ...Restaurant, categories: res.data.data }),
            );
            resolve(true);
          }
        })
        .catch((err) => {
          handleRequestError(err);
          reject(err);
        });
    });
  }

  function Deletecategory(id: string) {
    return new Promise((resolve, reject) => {
      axios
        .delete(
          `${url}/categories/delete?Id=${id}&RestaurantId=${Restaurant.id}`,
          authHeaders(User.token as string),
        )
        .then((res) => {
          if (res.status === 200) {
            setcategory(res.data.data);
            dispatch(
              SetRestaurant({ ...Restaurant, categories: res.data.data }),
            );
            resolve(true);
          }
        })
        .catch((err) => {
          handleRequestError(err);
          reject(err);
        });
    });
  }

  function Editcategory(id: string, ArName: string, EnName: string) {
    return new Promise((resolve, reject) => {
      const newcategory = [
        { id, nameAr: ArName, nameEn: EnName, isActive: true },
      ];

      axios
        .post(
          `${url}/categories/edit`,
          { RestaurantId: User.RestaurantId, Categories: newcategory },
          authHeaders(User.token as string),
        )
        .then((res) => {
          dispatch(SetRestaurant({ ...Restaurant, categories: res.data.data }));
          setcategory(res.data.data);
          notify(strings.Modified);
          resolve(true);
        })
        .catch((err) => {
          handleRequestError(err);
          reject(err);
        });
    });
  }

  // --- Products per category, race-safe (ignores stale responses) ----------
  const handleGetproduct = useCallback((Id: string) => {
    const requestId = ++productRequestId.current;
    setMenuItemsLoad(true);

    axios
      .get(`${url}/product/bycategory/${Id}`)
      .then((response) => {
        if (requestId !== productRequestId.current) return; // a newer request already superseded this one
        if (response.status === 200) {
          setMenuItems(response.data.data ? response.data.data : []);
        }
      })
      .catch((error) => {
        if (requestId !== productRequestId.current) return;
        console.log(error);
      })
      .finally(() => {
        if (requestId === productRequestId.current) setMenuItemsLoad(false);
      });
  }, []);

  function EditItem(Item: ProductDTO) {
    return new Promise((resolve) => {
      setMenuItems((prev) => {
        const next = [...prev];
        const index = next.findIndex((ele) => ele.id === Item.id);
        if (index !== -1) next[index] = Item;
        return next;
      });
      resolve(true);
    });
  }

  function DeleteItem(id: string) {
    Swal.fire({
      title: strings.AreyousuredeletingtheItem,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: strings.cancel,
      confirmButtonText: strings.Yesdeleteit,
    }).then((result: any) => {
      if (!result.isConfirmed) return;

      axios
        .delete(
          `${url}/product/delete?Id=${id}&CategoryId=${categoryActive}`,
          authHeaders(User.token as string),
        )
        .then((res) => {
          if (res.data.statusCode === 202) {
            setCreateOrEditItemModal(false);
            notify(
              strings.getLanguage() === Languages.AR
                ? res.data.messageAr
                : res.data.messageEn,
            );
            setMenuItems(res.data.data);
          }
        })
        .catch((err) => handleRequestError(err));
    });
  }

  const isStaff =
    User?.type === UserType.Admin || User?.type === UserType.Owner;

  return (
    <>
      <HeadTag
        title={strings.menu}
        Icon={`${RestaurantLogoPath}/${Restaurant.logo}`}
        description={`${Restaurant.name}`}
        keywords={"One card, NFC, nfc, chip"}
      />
      <section className={classes.body}>
        {/* Media section */}
        <div className={classes.Mediasection}>
          <div
            className={classes.LanguagePart}
            style={{
              background: `linear-gradient(180deg, rgba(63,63,63,0.6) 0%, rgba(0,212,255,0) 100%)`,
            }}
          >
            <div>
              {Restaurant.changeLanguageStatus && (
                <button className={classes.LanBtn} onClick={HandleLanChange}>
                  {_Lan === Languages.AR
                    ? LanguagesTitle.EN
                    : LanguagesTitle.AR}
                </button>
              )}
            </div>
            {isStaff && EditFlag && (
              <button
                className={
                  classes.LanBtn + " animate__animated animate__fadeIn"
                }
                onClick={() => HandleLogOut(dispatch)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                >
                  <g>
                    <g fill="tomato">
                      <path
                        d="M12 3.25a.75.75 0 0 1 0 1.5 7.25 7.25 0 0 0 0 14.5.75.75 0 0 1 0 1.5 8.75 8.75 0 1 1 0-17.5z"
                        fill="tomato"
                      />
                      <path
                        d="M16.47 9.53a.75.75 0 0 1 1.06-1.06l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H10a.75.75 0 0 1 0-1.5h8.19z"
                        fill="tomato"
                      />
                    </g>
                  </g>
                </svg>
              </button>
            )}
            {isStaff && EditFlag && (
              <button
                onClick={() => setSettingModal(true)}
                className={
                  classes.btn +
                  " animate__animated animate__fadeIn " +
                  classes.btnSettings
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  width="25"
                  height="25"
                  viewBox="0 0 32 32"
                >
                  <g>
                    <path
                      d="M29.21 11.84a3.92 3.92 0 0 1-3.09-5.3 1.84 1.84 0 0 0-.55-2.07 14.75 14.75 0 0 0-4.4-2.55 1.85 1.85 0 0 0-2.09.58 3.91 3.91 0 0 1-6.16 0 1.85 1.85 0 0 0-2.09-.58 14.82 14.82 0 0 0-4.1 2.3 1.86 1.86 0 0 0-.58 2.13 3.9 3.9 0 0 1-3.25 5.36 1.85 1.85 0 0 0-1.62 1.49A14.14 14.14 0 0 0 1 16a14.32 14.32 0 0 0 .19 2.35 1.85 1.85 0 0 0 1.63 1.55A3.9 3.9 0 0 1 6 25.41a1.82 1.82 0 0 0 .51 2.18 14.86 14.86 0 0 0 4.36 2.51 2 2 0 0 0 .63.11 1.84 1.84 0 0 0 1.5-.78 3.87 3.87 0 0 1 3.2-1.68 3.92 3.92 0 0 1 3.14 1.58 1.84 1.84 0 0 0 2.16.61 15 15 0 0 0 4-2.39 1.85 1.85 0 0 0 .54-2.11 3.9 3.9 0 0 1 3.13-5.39 1.85 1.85 0 0 0 1.57-1.52A14.5 14.5 0 0 0 31 16a14.35 14.35 0 0 0-.25-2.67 1.83 1.83 0 0 0-1.54-1.49zM21 16a5 5 0 1 1-5-5 5 5 0 0 1 5 5z"
                      fill="#000000"
                    />
                  </g>
                </svg>
              </button>
            )}
          </div>

          {Restaurant.videoStatus && (
            <div className={classes.MediaVideosection}>
              <div
                className={classes.restaurantDetails}
                style={{
                  backgroundColor: `rgba(${
                    Restaurant
                      ? Restaurant.color?.startsWith?.("#")
                        ? Restaurant.color
                        : rgbToHex(Restaurant.color || "0,0,0")
                      : "63, 63, 63"
                  },0.2)`,
                }}
              >
                <img
                  className={classes.LogoImg}
                  src={
                    Restaurant ? `${RestaurantLogoPath}/${Restaurant.logo}` : ""
                  }
                  alt=""
                />
              </div>
              <video
                autoPlay
                loop
                muted
                src={`${VideoPath}/${Restaurant.video?.fileName}`}
              >
                <source
                  src={`${VideoPath}/${Restaurant.video?.fileName}`}
                  type="video/mp4"
                />
              </video>
            </div>
          )}

          {Restaurant.offerStatus && (
            <Swiper
              dir={strings.getLanguage() === Languages.AR ? "rtl" : "ltr"}
              centeredSlides={true}
              autoplay={{ delay: 8000, disableOnInteraction: false }}
              pagination={false}
              navigation={false}
              modules={[Autoplay, Pagination, Navigation]}
            >
              {Restaurant.offers?.map((ele: AdvertisingMediaDTO) => (
                <SwiperSlide key={ele.id}>
                  <img
                    className={classes.SwiperImage}
                    src={`${OffersImagePath}/${ele.fileName}`}
                    alt=""
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Menu Section */}
        <div className={classes.MenuCard}>
          <div className={classes.MenuLisrCard}>
            {category.length > 0 && (
              <Swiper
                dir={strings.getLanguage() === Languages.AR ? "rtl" : "ltr"}
                slidesPerView={"auto"}
                pagination={false}
                navigation={false}
                modules={[Pagination]}
                className={
                  classes.SwiperMenuList +
                  ` ${isStaff ? classes.PadInEnd40px : " "}`
                }
              >
                {category.map((Categ) => (
                  <SwiperSlide
                    key={Categ.id}
                    className={
                      classes.MenuList +
                      `   mx-3 ${Categ.id === categoryActive ? classes.active : ""}`
                    }
                  >
                    <div
                      onClick={() => {
                        if (Categ.id === categoryActive) return; // avoid re-fetching the same category
                        setcategoryActive(Categ.id);
                        handleGetproduct(Categ.id);
                      }}
                      style={
                        Categ.id === categoryActive
                          ? {
                              borderBottomColor: `rgba(${
                                Restaurant
                                  ? Restaurant.color?.startsWith?.("#")
                                    ? Restaurant.color
                                    : rgbToHex(Restaurant.color || "0,0,0")
                                  : "63, 63, 63"
                              })`,
                            }
                          : {}
                      }
                      onMouseEnter={(ele) => {
                        if (Categ.id !== categoryActive) {
                          ele.currentTarget.style.borderBottomColor = `rgba(${
                            Restaurant
                              ? Restaurant.color?.startsWith?.("#")
                                ? Restaurant.color
                                : rgbToHex(Restaurant.color || "0,0,0")
                              : "63, 63, 63"
                          })`;
                        }
                      }}
                      onMouseLeave={(ele) => {
                        if (Categ.id !== categoryActive) {
                          ele.currentTarget.style.borderBottomColor =
                            "transparent";
                        }
                      }}
                    >
                      {strings.getLanguage() === Languages.AR
                        ? Categ.nameAr
                        : Categ.nameEn}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            {isStaff && EditFlag && (
              <div>
                {category.length === 0 && (
                  <div>
                    <h4 className="p-0 m-0">{strings.Categories}</h4>
                  </div>
                )}
                <div className={classes.AddCategory}>
                  <button
                    className={classes.AddIcon}
                    onClick={() => setCreateOrEditcategoryModal(true)}
                    onMouseEnter={(ele) => {
                      ele.currentTarget.style.backgroundColor = `rgba(${
                        Restaurant
                          ? Restaurant.color?.startsWith?.("#")
                            ? Restaurant.color
                            : rgbToHex(Restaurant.color || "0,0,0")
                          : "63, 63, 63"
                      })`;
                    }}
                    onMouseLeave={(ele) => {
                      ele.currentTarget.style.backgroundColor =
                        "rgba(0, 0, 0,0.9)";
                    }}
                  >
                    {category.length === 0 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        width="15"
                        height="15"
                        viewBox="0 0 448 448"
                      >
                        <g>
                          <path
                            d="M408 184H272a8 8 0 0 1-8-8V40c0-22.09-17.91-40-40-40s-40 17.91-40 40v136a8 8 0 0 1-8 8H40c-22.09 0-40 17.91-40 40s17.91 40 40 40h136a8 8 0 0 1 8 8v136c0 22.09 17.91 40 40 40s40-17.91 40-40V272a8 8 0 0 1 8-8h136c22.09 0 40-17.91 40-40s-17.91-40-40-40zm0 0"
                            fill="#000000"
                          />
                        </g>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        width="15"
                        height="15"
                        viewBox="0 0 492.493 492"
                      >
                        <g>
                          <path
                            d="M304.14 82.473 33.165 353.469a10.799 10.799 0 0 0-2.816 4.949L.313 478.973a10.716 10.716 0 0 0 2.816 10.136 10.675 10.675 0 0 0 7.527 3.114 10.6 10.6 0 0 0 2.582-.32l120.555-30.04a10.655 10.655 0 0 0 4.95-2.812l271-270.977zM476.875 45.523 446.711 15.36c-20.16-20.16-55.297-20.14-75.434 0l-36.949 36.95 105.598 105.597 36.949-36.949c10.07-10.066 15.617-23.465 15.617-37.715s-5.547-27.648-15.617-37.719zm0 0"
                            fill="#000000"
                          />
                        </g>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={classes.AllProductContainer}>
            <div className={classes.AllProductCard}>
              {MenuItemsLoad ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : MenuItems.length > 0 ? (
                MenuItems.map((product) => (
                  <ItemCard
                    key={product.id}
                    product={product}
                    EditFlag={EditFlag}
                    DeleteItem={DeleteItem}
                    EditItem={EditItem}
                  />
                ))
              ) : (
                <NoItems />
              )}

              {isStaff && EditFlag && (
                <div
                  onClick={() => setCreateOrEditItemModal(true)}
                  className={`animate__fadeIn animate__animated  ${
                    MenuItems.length > 0
                      ? `${classes.ProductCard} ${classes.AddProductCard}`
                      : classes.AddBtn
                  }`}
                  style={
                    MenuItems.length > 0
                      ? {
                          backgroundColor: `rgba(${
                            Restaurant
                              ? Restaurant.color?.startsWith?.("#")
                                ? Restaurant.color
                                : rgbToHex(Restaurant.color || "0,0,0")
                              : "63, 63, 63"
                          },0.1)`,
                          borderColor: `rgba(${
                            Restaurant
                              ? Restaurant.color?.startsWith?.("#")
                                ? Restaurant.color
                                : rgbToHex(Restaurant.color || "0,0,0")
                              : "63, 63, 63"
                          })`,
                        }
                      : {}
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                    width="25"
                    height="25"
                    viewBox="0 0 448 448"
                  >
                    <g>
                      <path
                        d="M408 184H272a8 8 0 0 1-8-8V40c0-22.09-17.91-40-40-40s-40 17.91-40 40v136a8 8 0 0 1-8 8H40c-22.09 0-40 17.91-40 40s17.91 40 40 40h136a8 8 0 0 1 8 8v136c0 22.09 17.91 40 40 40s40-17.91 40-40V272a8 8 0 0 1 8-8h136c22.09 0 40-17.91 40-40s-17.91-40-40-40zm0 0"
                        fill={`rgba(${
                          Restaurant
                            ? Restaurant.color?.startsWith?.("#")
                              ? Restaurant.color
                              : rgbToHex(Restaurant.color || "0,0,0")
                            : "63, 63, 63"
                        })`}
                      />
                    </g>
                  </svg>
                </div>
              )}
            </div>
            <div></div>
          </div>
        </div>

        {/* Modals */}
        <AddorEditcategoryModal
          CreateOrEditModal={CreateOrEditcategoryModal}
          setCreateOrEditModal={setCreateOrEditcategoryModal}
          category={category}
          Addcategory={Addcategory}
          Deletecategory={Deletecategory}
          Editcategory={Editcategory}
        />

        <AddorEditItemModal
          CreateOrEditItemModal={CreateOrEditItemModal}
          setCreateOrEditItemModal={setCreateOrEditItemModal}
          EditItem={EditItem}
          categoryID={categoryActive}
          setMenuItems={setMenuItems}
        />
        <SettingsModal
          SettingModal={SettingModal}
          setSettingModal={setSettingModal}
        />
        <CartWidget onPlaceOrder={PlaceOrder} />

        <ToastContainer />
      
        {currentOrderId && (
          <OrderStatusTracker
            status={orderStatus}
            accentColorRgb={getAccentColorRgb(Restaurant)}
          />
        )}
        {isStaff && (
          <button
            className={
              classes.AddIconCard +
              " animate__animated animate__fadeIn " +
              classes.EditViewBtn
            }
            onMouseEnter={(ele) => {
              ele.currentTarget.style.backgroundColor = `rgba(${Restaurant.color})`;
            }}
            onMouseLeave={(ele) => {
              ele.currentTarget.style.backgroundColor = "rgba(0, 0, 0,0.8)";
            }}
            onClick={() => setEditFlag(!EditFlag)}
          >
            {EditFlag ? (
              <div className="animate__animated animate__fadeIn ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  width="25"
                  height="25"
                  viewBox="0 0 511.999 511.999"
                >
                  <g>
                    <path
                      d="M508.745 246.041c-4.574-6.257-113.557-153.206-252.748-153.206S7.818 239.784 3.249 246.035a16.896 16.896 0 0 0 0 19.923c4.569 6.257 113.557 153.206 252.748 153.206s248.174-146.95 252.748-153.201a16.875 16.875 0 0 0 0-19.922zM255.997 385.406c-102.529 0-191.33-97.533-217.617-129.418 26.253-31.913 114.868-129.395 217.617-129.395 102.524 0 191.319 97.516 217.617 129.418-26.253 31.912-114.868 129.395-217.617 129.395z"
                      fill="#000000"
                    />
                    <path
                      d="M255.997 154.725c-55.842 0-101.275 45.433-101.275 101.275s45.433 101.275 101.275 101.275S357.272 311.842 357.272 256s-45.433-101.275-101.275-101.275zm0 168.791c-37.23 0-67.516-30.287-67.516-67.516s30.287-67.516 67.516-67.516 67.516 30.287 67.516 67.516-30.286 67.516-67.516 67.516z"
                      fill="#000000"
                    />
                  </g>
                </svg>
              </div>
            ) : (
              <div className="animate__animated animate__fadeIn ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  width="25"
                  height="25"
                  viewBox="0 0 492.493 492"
                >
                  <g>
                    <path
                      d="M304.14 82.473 33.165 353.469a10.799 10.799 0 0 0-2.816 4.949L.313 478.973a10.716 10.716 0 0 0 2.816 10.136 10.675 10.675 0 0 0 7.527 3.114 10.6 10.6 0 0 0 2.582-.32l120.555-30.04a10.655 10.655 0 0 0 4.95-2.812l271-270.977zM476.875 45.523 446.711 15.36c-20.16-20.16-55.297-20.14-75.434 0l-36.949 36.95 105.598 105.597 36.949-36.949c10.07-10.066 15.617-23.465 15.617-37.715s-5.547-27.648-15.617-37.719zm0 0"
                      fill="#000000"
                    />
                  </g>
                </svg>
              </div>
            )}
          </button>
        )}
      </section>
    </>
  );
}