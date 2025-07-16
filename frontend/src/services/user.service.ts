// // const avatarFile = event.target.files[0]
// // const { data, error } = await supabase
// //   .storage
// //   .from('avatars')
// //   .upload('public/avatar1.png', avatarFile, {
// //     cacheControl: '3600',
// //     upsert: false
// //   })

// export const uploadFile = async (file: File) => {
//     const { data, error } = await supabase
//         .storage
//         .from('avatars')
//         .upload('public/avatar1.png', file, {
//             cacheControl: '3600',
//             upsert: false
//         })
// }