"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Trash2, Plus } from "lucide-react";

interface SavedCard {
  id: string;
  last_four_digits: string;
  expiration_month: number;
  expiration_year: number;
  cardholder_name: string;
  date_created: string;
}

export default function SavedCards() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedCards();
  }, []);

  const loadSavedCards = async () => {
    try {
      const response = await fetch("/api/user/cards");
      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      }
    } catch (error) {
      console.error("Error loading saved cards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta tarjeta?")) {
      return;
    }

    try {
      const response = await fetch(`/api/user/cards/${cardId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCards(cards.filter(card => card.id !== cardId));
      } else {
        alert("Error al eliminar la tarjeta");
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      alert("Error al eliminar la tarjeta");
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Cargando tarjetas...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Mis Tarjetas Guardadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cards.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No tienes tarjetas guardadas</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Tarjeta
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">•••• {card.last_four_digits}</p>
                  <p className="text-sm text-gray-600">
                    {card.cardholder_name} - Expira {card.expiration_month}/{card.expiration_year}
                  </p>
                  <p className="text-xs text-gray-500">
                    Agregada el {new Date(card.date_created).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteCard(card.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Nueva Tarjeta
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}