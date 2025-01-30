import React from "react";
import { fetchUser } from "../features/user";
import { processPayment } from "../features/payment";
import { getUser } from "../entities/user";
import { formatCurrency } from "../shared/utils";
import { Header } from "../widgets/Header";
import { useStore } from "../app/store";
