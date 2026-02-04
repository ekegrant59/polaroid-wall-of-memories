export interface Polaroid {
    id: string;
    image: string;
    message: string;
    rotation: number;
    x: string;
    y: string;
    zIndex: number;
}

export interface Wall {
    id: string;
    user_id: string;
    slug: string;
    pin_code: string | null;
    title: string;
    letter_content: string;
    final_image_url: string;
    final_message: string;
    is_published: boolean;
    view_count: number;
    created_at: string;
}

export interface PolaroidDB {
    id: string;
    wall_id: string;
    image_url: string;
    message: string;
    position_x: string;
    position_y: string;
    rotation: number;
    z_index: number;
    created_at: string;
}
