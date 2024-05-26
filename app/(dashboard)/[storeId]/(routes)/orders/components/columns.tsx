"use client"

import { ColumnDef } from "@tanstack/react-table"

// Définition de BillboardColumn
export type BillboardColumn = {
  id: string
  label: string
  imageUrl: string
  createdAt: string
}

// Exportation de BillboardColumn
export const billboardColumns: ColumnDef<BillboardColumn>[] = [
  {
    accessorKey: "label",
    header: "Label",
  },
  {
    accessorKey: "imageUrl",
    header: "Image URL",
  },
  {
    accessorKey: "createdAt",
    header: "Créé le",
  },
]

// Définition et exportation d'OrderColumn (existante)
export type OrderColumn = {
  id: string
  phone: string
  address: string
  isPaid: boolean
  totalPrice: string
  products: string
  createdAt: string
}

export const orderColumns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "products",
    header: "Produits",
  },
  {
    accessorKey: "phone",
    header: "Téléphone",
  },
  {
    accessorKey: "address",
    header: "Adresse",
  },
  {
    accessorKey: "totalPrice",
    header: "Prix total",
  },
  {
    accessorKey: "isPaid",
    header: "Statut paiement",
  },
]