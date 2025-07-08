import { createClient } from "@/utils/supabase/client"

export interface GalleryImage {
  id: string
  user_id: string
  title: string
  artist?: string
  description?: string
  image_url: string
  image_path: string
  file_size?: number
  mime_type?: string
  width?: number
  height?: number
  created_at: string
  updated_at: string
}

export interface CreateImageData {
  title: string
  artist?: string
  description?: string
  file: File
}

export interface UpdateImageData {
  title?: string
  artist?: string
  description?: string
}

// Función para limpiar el nombre del archivo basado en el título
function sanitizeFileName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remover caracteres especiales
    .replace(/\s+/g, "-") // Reemplazar espacios con guiones
    .replace(/-+/g, "-") // Reemplazar múltiples guiones con uno solo
    .trim()
}

// Obtener todas las imágenes del usuario
export async function getUserImages(): Promise<GalleryImage[]> {
  const supabase = createClient()

  // Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("Error de autenticación:", authError)
    throw new Error("Usuario no autenticado")
  }

  console.log("Obteniendo imágenes para usuario:", user.id)

  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching images:", error)
    throw new Error(`Error al obtener las imágenes: ${error.message}`)
  }

  console.log("Imágenes obtenidas:", data?.length || 0)
  return data || []
}

// Subir una nueva imagen
export async function uploadImage(imageData: CreateImageData): Promise<GalleryImage> {
  const supabase = createClient()

  console.log("=== INICIANDO PROCESO DE SUBIDA ===")

  // Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("Error de autenticación:", authError)
    throw new Error("Usuario no autenticado")
  }

  console.log("✅ Usuario autenticado:", {
    id: user.id,
    email: user.email,
    role: user.role,
    aud: user.aud,
  })

  // Obtener extensión del archivo
  const fileExt = imageData.file.name.split(".").pop()

  // Crear nombre del archivo basado en el título
  const sanitizedTitle = sanitizeFileName(imageData.title)
  const timestamp = Date.now()
  const fileName = `${user.id}/${sanitizedTitle}-${timestamp}.${fileExt}`

  console.log("📁 Nombre del archivo:", fileName)
  console.log("📦 Bucket destino: container")

  try {
    // Verificar que el bucket existe y es accesible
    console.log("🔍 Verificando acceso al bucket...")
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error listando buckets:", bucketsError)
    } else {
      console.log(
        "📋 Buckets disponibles:",
        buckets?.map((b) => b.name),
      )
    }

    // Subir archivo a Supabase Storage usando el bucket "container"
    console.log("⬆️ Iniciando subida del archivo...")
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("container")
      .upload(fileName, imageData.file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("❌ Error uploading file:", uploadError)
      console.error("Error details:", {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        error: uploadError.error,
      })
      throw new Error(`Error al subir la imagen: ${uploadError.message}`)
    }

    console.log("✅ Archivo subido exitosamente:", uploadData)

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("container").getPublicUrl(fileName)

    console.log("🔗 URL pública generada:", publicUrl)

    // Obtener dimensiones de la imagen
    console.log("📐 Obteniendo dimensiones de la imagen...")
    const dimensions = await getImageDimensions(imageData.file)
    console.log("📏 Dimensiones:", dimensions)

    // Preparar datos para insertar - ASEGURAR QUE USAMOS LOS NOMBRES DE COLUMNA CORRECTOS
    const insertData = {
      user_id: user.id,
      title: imageData.title,
      artist: imageData.artist || null, // Usar 'artist' no 'artist_name'
      description: imageData.description || null,
      image_url: publicUrl,
      image_path: fileName,
      file_size: imageData.file.size,
      mime_type: imageData.file.type,
      width: dimensions.width,
      height: dimensions.height,
    }

    console.log("💾 Insertando metadatos en la base de datos:", insertData)

    // Guardar metadatos en la base de datos
    const { data, error } = await supabase.from("gallery_images").insert(insertData).select().single()

    if (error) {
      console.error("❌ Error saving image metadata:", error)
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })

      // Si hay error, eliminar el archivo subido
      console.log("🗑️ Eliminando archivo subido debido al error...")
      await supabase.storage.from("container").remove([fileName])

      throw new Error(`Error al guardar los metadatos: ${error.message}`)
    }

    console.log("✅ Metadatos guardados exitosamente:", data)
    console.log("=== PROCESO COMPLETADO EXITOSAMENTE ===")
    return data
  } catch (error) {
    console.error("💥 Error en uploadImage:", error)
    throw error
  }
}

// Actualizar metadatos de una imagen
export async function updateImage(id: string, updateData: UpdateImageData): Promise<GalleryImage> {
  const supabase = createClient()

  // Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Usuario no autenticado")
  }

  const { data, error } = await supabase
    .from("gallery_images")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating image:", error)
    throw new Error(`Error al actualizar la imagen: ${error.message}`)
  }

  return data
}

// Eliminar una imagen
export async function deleteImage(id: string): Promise<void> {
  const supabase = createClient()

  // Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Usuario no autenticado")
  }

  // Primero obtener la información de la imagen
  const { data: image, error: fetchError } = await supabase
    .from("gallery_images")
    .select("image_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (fetchError) {
    console.error("Error fetching image for deletion:", fetchError)
    throw new Error("Error al obtener la imagen para eliminar")
  }

  // Eliminar archivo del storage
  const { error: storageError } = await supabase.storage.from("container").remove([image.image_path])

  if (storageError) {
    console.error("Error deleting file from storage:", storageError)
  }

  // Eliminar registro de la base de datos
  const { error: dbError } = await supabase.from("gallery_images").delete().eq("id", id).eq("user_id", user.id)

  if (dbError) {
    console.error("Error deleting image from database:", dbError)
    throw new Error("Error al eliminar la imagen de la base de datos")
  }
}

// Función auxiliar para obtener dimensiones de la imagen
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      resolve({ width: 0, height: 0 })
    }
    img.src = URL.createObjectURL(file)
  })
}

// Validar si el archivo es una imagen válida
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Tipo de archivo no válido. Solo se permiten: JPEG, PNG, WebP, GIF",
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "El archivo es demasiado grande. Máximo 10MB",
    }
  }

  return { isValid: true }
}

// Verificar si el usuario está autenticado
export async function checkAuth(): Promise<{ isAuthenticated: boolean; user: any }> {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    console.log("🔐 Verificación de autenticación:", {
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      error: error,
    })

    return {
      isAuthenticated: !error && !!user,
      user: user,
    }
  } catch (error) {
    console.error("Error en checkAuth:", error)
    return {
      isAuthenticated: false,
      user: null,
    }
  }
}
