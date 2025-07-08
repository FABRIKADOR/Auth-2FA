"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Upload,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  FileImage,
  ArrowLeft,
  Loader2,
  LogIn,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  getUserImages,
  uploadImage,
  updateImage,
  deleteImage,
  validateImageFile,
  checkAuth,
  type GalleryImage,
  type CreateImageData,
  type UpdateImageData,
} from "@/utils/gallery"

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null)
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")

  const { toast } = useToast()
  const router = useRouter()

  // Estados para formularios
  const [uploadForm, setUploadForm] = useState({
    title: "",
    artist: "",
    description: "",
    file: null as File | null,
  })

  const [editForm, setEditForm] = useState({
    title: "",
    artist: "",
    description: "",
  })

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuthentication()
  }, [])

  // Cargar imágenes cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadImages()
    }
  }, [isAuthenticated])

  const checkAuthentication = async () => {
    try {
      setLoading(true)
      const authResult = await checkAuth()
      setIsAuthenticated(authResult.isAuthenticated)
      setUser(authResult.user)

      setDebugInfo(
        `Auth check: ${authResult.isAuthenticated ? "SUCCESS" : "FAILED"} - User: ${authResult.user?.email || "None"}`,
      )

      if (!authResult.isAuthenticated) {
        toast({
          title: "Acceso denegado",
          description: "Debes iniciar sesión para acceder a la galería",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error checking authentication:", error)
      setIsAuthenticated(false)
      setDebugInfo(`Auth error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const loadImages = async () => {
    try {
      setLoading(true)
      const userImages = await getUserImages()
      setImages(userImages)
      setDebugInfo((prev) => prev + ` | Images loaded: ${userImages.length}`)
    } catch (error) {
      console.error("Error loading images:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron cargar las imágenes",
        variant: "destructive",
      })

      // Si el error es de autenticación, redirigir al login
      if (error instanceof Error && error.message.includes("autenticado")) {
        setIsAuthenticated(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.isValid) {
      toast({
        title: "Archivo inválido",
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    setUploadForm({ ...uploadForm, file })
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.file || !uploadForm.title.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el título y selecciona una imagen",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      console.log("=== INICIANDO SUBIDA DE IMAGEN ===")
      console.log("Usuario:", user)
      console.log("Título:", uploadForm.title)
      console.log("Archivo:", uploadForm.file.name, uploadForm.file.size, "bytes")

      const imageData: CreateImageData = {
        title: uploadForm.title.trim(),
        artist: uploadForm.artist.trim() || undefined,
        description: uploadForm.description.trim() || undefined,
        file: uploadForm.file,
      }

      const result = await uploadImage(imageData)
      console.log("=== IMAGEN SUBIDA EXITOSAMENTE ===", result)

      toast({
        title: "¡Éxito!",
        description: `Imagen "${uploadForm.title}" subida correctamente`,
      })

      // Resetear formulario y cerrar dialog
      setUploadForm({ title: "", artist: "", description: "", file: null })
      setUploadDialogOpen(false)

      // Recargar imágenes
      await loadImages()
    } catch (error) {
      console.error("=== ERROR AL SUBIR IMAGEN ===", error)
      toast({
        title: "Error al subir imagen",
        description: error instanceof Error ? error.message : "Error desconocido al subir la imagen",
        variant: "destructive",
      })

      // Si el error es de autenticación, verificar estado
      if (error instanceof Error && error.message.includes("autenticado")) {
        await checkAuthentication()
      }
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingImage || !editForm.title.trim()) {
      toast({
        title: "Campo requerido",
        description: "El título es obligatorio",
        variant: "destructive",
      })
      return
    }

    try {
      const updateData: UpdateImageData = {
        title: editForm.title.trim(),
        artist: editForm.artist.trim() || undefined,
        description: editForm.description.trim() || undefined,
      }

      await updateImage(editingImage.id, updateData)

      toast({
        title: "¡Éxito!",
        description: "Imagen actualizada correctamente",
      })

      setEditDialogOpen(false)
      setEditingImage(null)
      await loadImages()
    } catch (error) {
      console.error("Error updating image:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la imagen",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteImageId) return

    try {
      await deleteImage(deleteImageId)

      toast({
        title: "¡Éxito!",
        description: "Imagen eliminada correctamente",
      })

      setDeleteImageId(null)
      await loadImages()
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar la imagen",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (image: GalleryImage) => {
    setEditingImage(image)
    setEditForm({
      title: image.title,
      artist: image.artist || "",
      description: image.description || "",
    })
    setEditDialogOpen(true)
  }

  const openViewDialog = (image: GalleryImage) => {
    setSelectedImage(image)
    setViewDialogOpen(true)
  }

  // Si no está autenticado, mostrar mensaje de login
  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <LogIn className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Requerido</h2>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para acceder a tu galería de arte personal.</p>
          {debugInfo && (
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              Debug: {debugInfo}
            </div>
          )}
          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full bg-transparent">
                Crear Cuenta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Cargando galería...</p>
          {debugInfo && (
            <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              Debug: {debugInfo}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <FileImage className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Galería de Arte</h1>
                  {user && <p className="text-sm text-gray-600">Bienvenido, {user.email}</p>}
                </div>
              </div>
            </div>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Subir Imagen</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>Subir Nueva Imagen</span>
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="upload-file">Imagen *</Label>
                    <Input id="upload-file" type="file" accept="image/*" onChange={handleFileSelect} className="mt-1" />
                    <p className="text-xs text-gray-500 mt-1">Formatos: JPEG, PNG, WebP, GIF. Máximo 10MB</p>
                    <p className="text-xs text-blue-600 mt-1">
                      💡 La imagen se guardará con el nombre del título en el bucket "container"
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="upload-title">Título *</Label>
                    <Input
                      id="upload-title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      placeholder="Título de la obra (será el nombre del archivo)"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="upload-artist">Artista</Label>
                    <Input
                      id="upload-artist"
                      value={uploadForm.artist}
                      onChange={(e) => setUploadForm({ ...uploadForm, artist: e.target.value })}
                      placeholder="Nombre del artista"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="upload-description">Descripción</Label>
                    <Textarea
                      id="upload-description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      placeholder="Descripción de la obra..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  {/* Debug info */}
                  {debugInfo && (
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
                      <div className="flex items-center gap-1 mb-1">
                        <AlertCircle className="w-3 h-3" />
                        <span className="font-medium">Debug Info:</span>
                      </div>
                      {debugInfo}
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUploadDialogOpen(false)}
                      disabled={uploading}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Subir
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug info */}
        {debugInfo && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Información de Debug</span>
            </div>
            <p className="text-blue-700 text-sm font-mono">{debugInfo}</p>
          </div>
        )}

        {images.length === 0 ? (
          <div className="text-center py-16">
            <FileImage className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu galería está vacía</h2>
            <p className="text-gray-600 mb-2">Comienza subiendo tu primera obra de arte</p>
            <p className="text-sm text-blue-600 mb-6">
              Las imágenes se guardarán en el bucket "container" con el nombre del título
            </p>
            <Button onClick={() => setUploadDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Subir Primera Imagen
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {images.length} {images.length === 1 ? "obra" : "obras"} en tu colección
              </h2>
              <p className="text-sm text-gray-600">Almacenadas en el bucket "container" de Supabase</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <Card key={image.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square">
                    <Image
                      src={image.image_url || "/placeholder.svg"}
                      alt={image.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openViewDialog(image)}
                          className="bg-white/90 hover:bg-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEditDialog(image)}
                          className="bg-white/90 hover:bg-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setDeleteImageId(image.id)}
                          className="bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{image.title}</h3>
                    {image.artist && (
                      <p className="text-sm text-gray-600 truncate flex items-center mt-1">
                        <User className="w-3 h-3 mr-1" />
                        {image.artist}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 flex items-center mt-2">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(image.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-blue-600 mt-1 truncate" title={image.image_path}>
                      📁 {image.image_path.split("/").pop()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Dialog para ver imagen */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedImage.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative aspect-video max-h-96">
                  <Image
                    src={selectedImage.image_url || "/placeholder.svg"}
                    alt={selectedImage.title}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedImage.artist && (
                    <div>
                      <span className="font-medium text-gray-700">Artista:</span>
                      <p className="text-gray-600">{selectedImage.artist}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Fecha:</span>
                    <p className="text-gray-600">{new Date(selectedImage.created_at).toLocaleDateString()}</p>
                  </div>
                  {selectedImage.width && selectedImage.height && (
                    <div>
                      <span className="font-medium text-gray-700">Dimensiones:</span>
                      <p className="text-gray-600">
                        {selectedImage.width} × {selectedImage.height} px
                      </p>
                    </div>
                  )}
                  {selectedImage.file_size && (
                    <div>
                      <span className="font-medium text-gray-700">Tamaño:</span>
                      <p className="text-gray-600">{(selectedImage.file_size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Archivo:</span>
                    <p className="text-gray-600 text-xs break-all">{selectedImage.image_path}</p>
                  </div>
                </div>
                {selectedImage.description && (
                  <div>
                    <span className="font-medium text-gray-700">Descripción:</span>
                    <p className="text-gray-600 mt-1">{selectedImage.description}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar imagen */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5" />
              <span>Editar Imagen</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Título de la obra"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-artist">Artista</Label>
              <Input
                id="edit-artist"
                value={editForm.artist}
                onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })}
                placeholder="Nombre del artista"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Descripción de la obra..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                <Edit className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={!!deleteImageId} onOpenChange={() => setDeleteImageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La imagen será eliminada permanentemente de tu galería y del bucket
              "container".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
