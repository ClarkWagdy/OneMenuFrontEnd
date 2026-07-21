"use client";
import { url } from "@/config/Api/url";
import { HandleLogOut } from "@/config/HandleLogOut/HandleLogOut";
import { strings } from "@/config/localization/LocalizedStrings";
import { useAppDispatch, useAppSelector } from "@/config/Store/hooks";
import axios from "axios";
import React, { useEffect, useState } from "react";
import classes from "../Dashboard.module.scss";
// @ts-ignore
const Switch = require("react-switch").default;
import NoItems from "@/Component/NoItems/NoItems";
import Loading from "@/Component/Loading/Loading";
import HeadTag from "@/Component/Head/HeadTag";
import Sidebar from "../Sidebar";
import { toggleSidenav } from "@/config/toggleSide/toggleSidenav";
import { Languages } from "@/config/localization/Languages";
import Navbar from "../Navbar";
import Authenticating from "@/config/Authenticating/Authenticating";

// Matches the backend UserListDTO
interface UserListItem {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  roles: string[];
  restaurantId?: string | null;
  creationTime: string;
}

interface RestaurantListItem {
  id: string;
  name: string;
}

const AVAILABLE_ROLES = ["User", "Owner", "Admin", "Waiter", "KitchenMan"];

// Roles that require a restaurant to be attached to the user.
const ROLES_REQUIRING_RESTAURANT = ["Owner", "Waiter", "KitchenMan"];

// Shape of the add/edit form. `password` is only sent when creating a user
// (and only if the person typed one while editing, in case you want to
// support optional password resets from this same form).
interface UserFormState {
  id?: string;
  userName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  roles: string[];
  restaurantId?: string | null;
}

const EMPTY_FORM: UserFormState = {
  userName: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  roles: [],
  restaurantId: null,
};

export default function AllUsers() {
  Authenticating();
  const dispatch = useAppDispatch();

  const User = useAppSelector((state) => state.User);
  const [UserList, setUserList] = useState<UserListItem[]>([]);
  const [Name, setName] = useState<string>("");
  const [RoleFilter, setRoleFilter] = useState<string>("");
  const [Load, SetLoad] = useState<boolean>(true);
  const [Count, setCount] = useState<number>(25);
  const [PageNumber, setPageNumber] = useState<number>(1);
  const [Refresh, SetRefresh] = useState<boolean>(false);

  // ----- Add / Edit modal state -----
  const [ShowModal, setShowModal] = useState<boolean>(false);
  const [ModalMode, setModalMode] = useState<"add" | "edit">("add");
  const [Form, setForm] = useState<UserFormState>(EMPTY_FORM);
  const [Saving, setSaving] = useState<boolean>(false);
  const [FormError, setFormError] = useState<string>("");
  const [RestaurantList, setRestaurantList] = useState<RestaurantListItem[]>(
    [],
  );

  // Whether the currently selected role(s) require a restaurant to be picked
  const NeedsRestaurant = Form.roles.some((r) =>
    ROLES_REQUIRING_RESTAURANT.includes(r),
  );

  // Load once — used to populate the restaurant picker in the add/edit modal.
  useEffect(() => {
    axios
      .get(`${url}/restaurant?MaxResultCount=1000`, {
        headers: { Authorization: "Bearer " + User.token },
      })
      .then((response) => {
        setRestaurantList(response.data.items ?? response.data.data ?? []);
      })
      .catch((err) => {
        console.log(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function OpenAddModal() {
    setModalMode("add");
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  }

  function OpenEditModal(u: UserListItem) {
    setModalMode("edit");
    setForm({
      id: u.id,
      userName: u.userName,
      fullName: u.fullName,
      email: u.email,
      phoneNumber: u.phoneNumber,
      password: "",
      roles: u.roles ?? [],
      restaurantId: u.restaurantId ?? null,
    });
    setFormError("");
    setShowModal(true);
  }

  function CloseModal() {
    if (Saving) return;
    setShowModal(false);
  }

  // Roles render as radio buttons, so this is effectively single-select:
  // picking a role replaces whatever was picked before. If the new role
  // doesn't need a restaurant, the previously chosen restaurant is cleared.
  function HandleRoleSelect(role: string) {
    setForm((prev) => ({
      ...prev,
      roles: [role],
      restaurantId: ROLES_REQUIRING_RESTAURANT.includes(role)
        ? prev.restaurantId
        : null,
    }));
  }

  function HandleFormChange(field: keyof UserFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function ValidateForm(): string {
    if (!Form.userName.trim()) return "Username is required.";
    if (!Form.fullName.trim()) return "Full name is required.";
    if (!Form.email.trim()) return "Email is required.";
    if (ModalMode === "add" && !Form.password.trim())
      return "Password is required for new users.";
    if (Form.roles.length === 0) return "Select a role.";
    if (NeedsRestaurant && !Form.restaurantId)
      return "Select a restaurant for this role.";
    return "";
  }

  function HandleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = ValidateForm();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError("");
    setSaving(true);

    const payload: Partial<UserFormState> = {
      userName: Form.userName,
      fullName: Form.fullName,
      email: Form.email,
      phoneNumber: Form.phoneNumber,
      roles: Form.roles,
      restaurantId: NeedsRestaurant ? Form.restaurantId : null,
    };

    // Only include password when it's set (required on add, optional on edit)
    if (Form.password.trim()) {
      payload.password = Form.password;
    }

    const request =
      ModalMode === "add"
        ? axios.post(`${url}/user/user`, payload, {
            headers: { Authorization: "Bearer " + User.token },
          })
        : axios.put(
            `${url}/user/user`,
            { ...payload, id: Form.id },
            { headers: { Authorization: "Bearer " + User.token } },
          );

    request
      .then(() => {
        setSaving(false);
        setShowModal(false);
        SetRefresh((prev) => !prev);
      })
      .catch((err) => {
        console.log(err);
        setSaving(false);
        setFormError(
          err?.response?.data?.error?.message ||
            "Something went wrong while saving. Please try again.",
        );
      });
  }

  // Toggle isActive for a user.
  function HandleToggleActive(newActiveState: boolean, id: string) {
    SetLoad(true);
    axios
      .put(
        `${url}/user/user`,
        { id: id, isActive: newActiveState },
        {
          headers: {
            Authorization: "Bearer " + User.token,
          },
        },
      )
      .then(() => {
        SetRefresh((prev) => !prev);
      })
      .catch((err) => {
        console.log(err);
        SetLoad(false);
      });
  }

  useEffect(() => {
    SetLoad(true);
    axios
      .get(
        `${url}/user/users?${Name ? `Filter=${Name}&` : ""}${
          RoleFilter ? `Role=${RoleFilter}&` : ""
        }MaxResultCount=${Count}&SkipCount=${(PageNumber - 1) * Count}`,
        {
          headers: {
            Authorization: "Bearer " + User.token,
          },
        },
      )
      .then(function (response) {
        if (response.status === 200) {
          // PagedResultDto shape: { items: [...], totalCount }
          setUserList(response.data.items ?? response.data.data ?? []);
        }
        SetLoad(false);
      })
      .catch(function (error) {
        SetLoad(false);
        if (error?.request?.status) {
          HandleLogOut(dispatch);
        }
      });
  }, [Name, RoleFilter, PageNumber, Count, Refresh]);

  return (
    <>
      <HeadTag
        title={strings.Dashboard}
        description="All in one chip"
        keywords={"One card, NFC, nfc, chip"}
      />

      <section
        id="sidenavBody"
        className={`g-sidenav-show  bg-gray-100 mxh-100-ovh ${
          strings.getLanguage() === Languages.AR ? " rtl" : ""
        } `}
      >
        <Sidebar toggleSidenav={toggleSidenav} CurrentPage={3} />
        <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
          <Navbar CurrentPage={3} toggleSidenav={toggleSidenav} />

          <div
            className={
              classes.H100center + " animate__animated animate__fadeInUp"
            }
          >
            <div className={"container-fluid py-4  "}>
              <div className="row">
                <div className="col-12 mb-3">
                  <div
                    className={
                      "card px-3 py-2 d-flex flex-row align-items-center justify-content-between flex-wrap gap-2"
                    }
                  >
                    <div>
                      <h6 className="p-0 m-0">All Users</h6>
                      <p className="text-sm p-0 m-0 ">
                        All accounts across the system — owners, waiters,
                        kitchen staff
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn bg-gradient-dark m-0"
                      onClick={OpenAddModal}
                    >
                      + Add User
                    </button>
                  </div>
                </div>

                <div className="col-12">
                  <div className={Load ? "card m-0 min-h-40vh" : "card m-0"}>
                    {Load ? (
                      <Loading Card />
                    ) : UserList && UserList.length > 0 ? (
                      <>
                        <div className="card-header d-flex align-items-center justify-content-between pb-0 flex-wrap gap-2">
                          <h6>All Users</h6>
                          <div className="d-flex align-items-center gap-2">
                            <select
                              className="form-control"
                              value={RoleFilter}
                              onChange={(e) => setRoleFilter(e.target.value)}
                            >
                              <option value="">All Roles</option>
                              <option value="Owner">Owner</option>
                              <option value="Waiter">Waiter</option>
                              <option value="KitchenMan">Kitchen</option>
                            </select>
                            <div className="input-group">
                              <span className="input-group-text text-body">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  version="1.1"
                                  width="15"
                                  height="15"
                                  viewBox="0 0 461.516 461.516"
                                >
                                  <g>
                                    <path
                                      d="M185.746 371.332a185.294 185.294 0 0 0 113.866-39.11L422.39 455c9.172 8.858 23.787 8.604 32.645-.568 8.641-8.947 8.641-23.131 0-32.077L332.257 299.577c62.899-80.968 48.252-197.595-32.716-260.494S101.947-9.169 39.048 71.799-9.204 269.394 71.764 332.293a185.64 185.64 0 0 0 113.982 39.039zM87.095 87.059c54.484-54.485 142.82-54.486 197.305-.002s54.486 142.82.002 197.305-142.82 54.486-197.305.002l-.002-.002c-54.484-54.087-54.805-142.101-.718-196.585l.718-.718z"
                                      fill="#000000"
                                    ></path>
                                  </g>
                                </svg>
                              </span>
                              <input
                                type="text"
                                className="form-control inputSearch"
                                placeholder={strings.search}
                                onChange={(e) => setName(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="card-body px-0 pt-0 pb-2">
                          <div className="table-responsive p-0">
                            <table className="table align-items-center mb-0">
                              <thead>
                                <tr>
                                  <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                    User
                                  </th>
                                  <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                    Role
                                  </th>
                                  <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                    Phone
                                  </th>
                                  <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                    Status
                                  </th>
                                  <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                    {strings.subscriptiontime}
                                  </th>
                                  <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                    Edit
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {UserList.map((u) => (
                                  <tr key={u.id}>
                                    <td>
                                      <div className="d-flex flex-column px-2 py-1">
                                        <h6 className="mb-0 text-sm">
                                          {u.fullName || u.userName}
                                        </h6>
                                        <p className="text-xs text-secondary mb-0">
                                          {u.email}
                                        </p>
                                      </div>
                                    </td>
                                    <td>
                                      {u.roles.map((r) => (
                                        <span
                                          key={r}
                                          className="badge badge-sm bg-gradient-secondary me-1"
                                        >
                                          {r}
                                        </span>
                                      ))}
                                    </td>
                                    <td className="text-sm">
                                      {u.phoneNumber}
                                    </td>
                                    <td className="align-middle text-center text-sm">
                                      <Switch
                                        onChange={(checked: boolean) =>
                                          HandleToggleActive(checked, u.id)
                                        }
                                        checked={!!u.isActive}
                                        onColor="#68B984"
                                        onHandleColor="#68B984"
                                        handleDiameter={30}
                                        uncheckedIcon={false}
                                        checkedIcon={false}
                                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                        height={20}
                                        width={48}
                                      />
                                    </td>
                                    <td className="align-middle text-center">
                                      <span className="text-secondary text-xs font-weight-bold">
                                        {new Date(u.creationTime)
                                          .toISOString()
                                          .slice(0, 10)}
                                      </span>
                                    </td>
                                    <td className="align-middle text-center">
                                      <button
                                        type="button"
                                        className="btn btn-link text-dark px-2 mb-0"
                                        title="Edit user"
                                        onClick={() => OpenEditModal(u)}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    ) : (
                      <NoItems />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>

      {ShowModal && (
        <div
          className="modal d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={CloseModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <form onSubmit={HandleSubmit}>
                <div className="modal-header">
                  <h6 className="modal-title m-0">
                    {ModalMode === "add" ? "Add New User" : "Edit User"}
                  </h6>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={CloseModal}
                  ></button>
                </div>

                <div className="modal-body">
                  {FormError && (
                    <div className="alert alert-danger py-2 text-sm">
                      {FormError}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label text-sm">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={Form.userName}
                      onChange={(e) =>
                        HandleFormChange("userName", e.target.value)
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-sm">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={Form.fullName}
                      onChange={(e) =>
                        HandleFormChange("fullName", e.target.value)
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-sm">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={Form.email}
                      onChange={(e) =>
                        HandleFormChange("email", e.target.value)
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-sm">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={Form.phoneNumber}
                      onChange={(e) =>
                        HandleFormChange("phoneNumber", e.target.value)
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-sm">
                      {ModalMode === "add"
                        ? "Password"
                        : "New Password (optional)"}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={Form.password}
                      onChange={(e) =>
                        HandleFormChange("password", e.target.value)
                      }
                      placeholder={
                        ModalMode === "edit"
                          ? "Leave blank to keep current"
                          : ""
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-sm d-block">
                      Role
                    </label>
                    <div className="d-flex gap-3 flex-wrap">
                      {AVAILABLE_ROLES.map((role) => (
                        <div className="form-check" key={role}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="user-role"
                            id={`role-${role}`}
                            checked={Form.roles.includes(role)}
                            onChange={() => HandleRoleSelect(role)}
                          />
                          <label
                            className="form-check-label text-sm"
                            htmlFor={`role-${role}`}
                          >
                            {role}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {NeedsRestaurant && (
                    <div className="mb-1 mt-3">
                      <label className="form-label text-sm">
                        Restaurant
                      </label>
                      <select
                        className="form-control"
                        value={Form.restaurantId ?? ""}
                        onChange={(e) =>
                          HandleFormChange("restaurantId", e.target.value)
                        }
                      >
                        <option value="">Select a restaurant...</option>
                        {RestaurantList.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary m-0"
                    onClick={CloseModal}
                    disabled={Saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn bg-gradient-dark m-0"
                    disabled={Saving}
                  >
                    {Saving
                      ? "Saving..."
                      : ModalMode === "add"
                        ? "Create User"
                        : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}