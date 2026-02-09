// app/profile/edit/page.tsx
import EditProfileForm from "./EditProfileForm";
export default async function EditProfilePage() {

  return (
       
    <div className="min-h-screen bg-bg-surface py-12">    
      <div className="max-w-2xl mx-auto">
        <EditProfileForm />
      </div>
    </div>
  );
}