import Image from 'next/image'
import { MapPin, Star } from 'lucide-react'

interface ItemCardProps {
  id: string
  title: string
  imageUrl: string
  pricePerDay?: number
  pricePerHour?: number
  location: string
  condition: string
  available: boolean
  user: {
    name: string
    avatarUrl?: string
    rating?: number
  }
}

export default function ItemCard({
  title,
  imageUrl,
  pricePerDay,
  pricePerHour,
  location,
  condition,
  available,
  user
}: ItemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl || '/placeholder.jpg'}
          alt={title}
          fill
          className="object-cover"
        />
        {!available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Verliehen</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{title}</h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{location}</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">Zustand: {condition}</span>
          {user.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm">{user.rating}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            {pricePerDay && (
              <p className="font-semibold text-green-600">
                {pricePerDay}€<span className="text-sm font-normal">/Tag</span>
              </p>
            )}
            {pricePerHour && (
              <p className="text-sm text-gray-600">
                {pricePerHour}€/Stunde
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-700">{user.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}