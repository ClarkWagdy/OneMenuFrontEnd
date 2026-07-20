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

  // Toggle isActive for a user. Adjust the endpoint/method to match
  // whatever route you exposed on the backend for this — this assumes
  // POST /user/toggle-active/{id}. Swap it out if yours differs.
  function HandleToggleActive(newActiveState: boolean, id: string) {
    SetLoad(true);
    axios
      .put(
        `${url}/user/user/${id}`,
        {isActive: newActiveState},
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
                  <div className={"card px-3 py-2"}>
                    <h6 className="p-0 m-0">All Users</h6>
                    <p className="text-sm p-0 m-0 ">
                      All accounts across the system — owners, waiters,
                      kitchen staff
                    </p>
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
    </>
  );
}